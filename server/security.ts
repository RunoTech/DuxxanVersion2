import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import helmet from 'helmet';
import { Request, Response, NextFunction } from 'express';

// Advanced Rate Limiting Configuration
export const createRateLimiter = (windowMs: number, max: number, message: string) => {
  return rateLimit({
    windowMs,
    max,
    message: { error: message },
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    // Skip successful requests to allow normal usage
    skipSuccessfulRequests: false,
    // Skip failed requests to prevent abuse
    skipFailedRequests: true,
    // Custom key generator for better tracking
    keyGenerator: (req: Request) => {
      return req.ip + ':' + (req.get('User-Agent') || 'unknown');
    }
  });
};

// Tiered Rate Limiting Strategy
export const globalRateLimit = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  1000, // 1000 requests per IP
  'Too many requests from this IP, please try again later.'
);

export const strictRateLimit = createRateLimiter(
  5 * 60 * 1000, // 5 minutes
  50, // 50 requests per IP
  'Rate limit exceeded. Please slow down your requests.'
);

export const authRateLimit = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  10, // 10 auth attempts per IP
  'Too many authentication attempts. Please try again later.'
);

export const createRateLimit = createRateLimiter(
  10 * 60 * 1000, // 10 minutes
  5, // 5 creation attempts per IP
  'Too many creation attempts. Please wait before creating more content.'
);

// Progressive Slowdown Middleware
export const progressiveSlowdown = slowDown({
  windowMs: 5 * 60 * 1000, // 5 minutes
  delayAfter: 10, // Allow 10 requests per windowMs without delay
  delayMs: 500, // Add 500ms delay per request after delayAfter
  maxDelayMs: 10000, // Maximum delay of 10 seconds
  // Skip successful requests to allow normal usage
  skipSuccessfulRequests: false,
  skipFailedRequests: true,
});

// Security Headers with Helmet
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      connectSrc: ["'self'", "wss:", "ws:"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
});

// IP Blocking and Suspicious Activity Detection
class SecurityMonitor {
  private suspiciousIPs = new Map<string, {
    requests: number;
    lastActivity: number;
    blocked: boolean;
    violations: string[];
  }>();

  private readonly MAX_REQUESTS_PER_SECOND = 10;
  private readonly BLOCK_DURATION = 30 * 60 * 1000; // 30 minutes
  private readonly VIOLATION_THRESHOLD = 5;

  trackRequest(ip: string, userAgent: string = 'unknown'): boolean {
    const now = Date.now();
    const key = `${ip}:${userAgent}`;
    
    if (!this.suspiciousIPs.has(key)) {
      this.suspiciousIPs.set(key, {
        requests: 1,
        lastActivity: now,
        blocked: false,
        violations: [],
      });
      return true;
    }

    const data = this.suspiciousIPs.get(key)!;
    
    // Check if IP is currently blocked
    if (data.blocked && (now - data.lastActivity) < this.BLOCK_DURATION) {
      return false;
    }

    // Reset block if block duration has passed
    if (data.blocked && (now - data.lastActivity) >= this.BLOCK_DURATION) {
      data.blocked = false;
      data.requests = 0;
      data.violations = [];
    }

    // Count requests in the last second
    if ((now - data.lastActivity) < 1000) {
      data.requests++;
    } else {
      data.requests = 1;
    }

    data.lastActivity = now;

    // Check for suspicious activity
    if (data.requests > this.MAX_REQUESTS_PER_SECOND) {
      data.violations.push(`High frequency: ${data.requests} req/sec at ${new Date(now).toISOString()}`);
      
      if (data.violations.length >= this.VIOLATION_THRESHOLD) {
        data.blocked = true;
        console.warn(`🚫 IP ${ip} blocked for suspicious activity:`, data.violations);
        return false;
      }
    }

    this.suspiciousIPs.set(key, data);
    return true;
  }

  isBlocked(ip: string, userAgent: string = 'unknown'): boolean {
    const key = `${ip}:${userAgent}`;
    const data = this.suspiciousIPs.get(key);
    
    if (!data) return false;
    
    const now = Date.now();
    if (data.blocked && (now - data.lastActivity) >= this.BLOCK_DURATION) {
      data.blocked = false;
      return false;
    }
    
    return data.blocked;
  }

  getStats() {
    const now = Date.now();
    let active = 0;
    let blocked = 0;
    
    const entries = Array.from(this.suspiciousIPs.entries());
    for (const [, data] of entries) {
      if ((now - data.lastActivity) < 5 * 60 * 1000) {
        active++;
      }
      if (data.blocked && (now - data.lastActivity) < this.BLOCK_DURATION) {
        blocked++;
      }
    }

    return { active, blocked, total: this.suspiciousIPs.size };
  }

  // Clean up old entries every hour
  cleanup() {
    const now = Date.now();
    const cutoff = 60 * 60 * 1000; // 1 hour
    const keysToDelete: string[] = [];
    
    for (const [key, data] of this.suspiciousIPs) {
      if ((now - data.lastActivity) > cutoff && !data.blocked) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => this.suspiciousIPs.delete(key));
  }
}

export const securityMonitor = new SecurityMonitor();

// Cleanup old entries every hour
setInterval(() => {
  securityMonitor.cleanup();
}, 60 * 60 * 1000);

// Security Monitoring Middleware
export const securityMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const userAgent = req.get('User-Agent') || 'unknown';

  // Check if IP is blocked
  if (securityMonitor.isBlocked(ip, userAgent)) {
    return res.status(429).json({
      error: 'Access temporarily blocked due to suspicious activity',
      retryAfter: 1800, // 30 minutes
    });
  }

  // Track request
  if (!securityMonitor.trackRequest(ip, userAgent)) {
    return res.status(429).json({
      error: 'Request rate exceeded. Please slow down.',
      retryAfter: 1800,
    });
  }

  next();
};

// Request Size Limiting
export const requestSizeLimit = (req: Request, res: Response, next: NextFunction) => {
  const contentLength = parseInt(req.get('Content-Length') || '0');
  const MAX_REQUEST_SIZE = 10 * 1024 * 1024; // 10MB

  if (contentLength > MAX_REQUEST_SIZE) {
    return res.status(413).json({
      error: 'Request too large',
      maxSize: '10MB',
    });
  }

  next();
};

// Suspicious Pattern Detection
export const patternDetection = (req: Request, res: Response, next: NextFunction) => {
  const userAgent = req.get('User-Agent') || '';
  const url = req.url.toLowerCase();
  
  // Check for suspicious patterns
  const suspiciousPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    /sqlmap/i,
    /nikto/i,
    /nmap/i,
    /masscan/i,
  ];

  const sqlInjectionPatterns = [
    /union.*select/i,
    /select.*from/i,
    /insert.*into/i,
    /delete.*from/i,
    /drop.*table/i,
    /exec.*\(/i,
    /script.*>/i,
  ];

  // Check User-Agent
  if (suspiciousPatterns.some(pattern => pattern.test(userAgent))) {
    console.warn(`🚨 Suspicious User-Agent detected: ${userAgent} from ${req.ip}`);
    return res.status(403).json({ error: 'Access denied' });
  }

  // Check URL for SQL injection attempts
  if (sqlInjectionPatterns.some(pattern => pattern.test(url))) {
    console.warn(`🚨 SQL injection attempt detected: ${url} from ${req.ip}`);
    return res.status(403).json({ error: 'Access denied' });
  }

  next();
};

// Connection Limiting
export const connectionLimiter = (req: Request, res: Response, next: NextFunction) => {
  // This would typically be handled by a reverse proxy like nginx
  // But we can implement basic connection tracking
  const ip = req.ip || 'unknown';
  
  // Add connection tracking logic here if needed
  // For now, just pass through
  next();
};

// Security Status Endpoint (admin only)
export const getSecurityStatus = (req: Request, res: Response) => {
  const stats = securityMonitor.getStats();
  
  res.json({
    timestamp: new Date().toISOString(),
    security: {
      activeIPs: stats.active,
      blockedIPs: stats.blocked,
      totalTracked: stats.total,
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
    },
    rateLimit: {
      windowMs: '15 minutes',
      globalLimit: 1000,
      strictLimit: 50,
      authLimit: 10,
      createLimit: 5,
    },
  });
};