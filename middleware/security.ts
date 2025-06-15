import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import { body, validationResult } from 'express-validator';
import crypto from 'crypto';

// CORS configuration
export const corsOptions = {
  origin: function (origin: any, callback: any) {
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5000',
      'https://duxxan.replit.app',
      process.env.FRONTEND_URL
    ].filter(Boolean);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-CSRF-Token'],
  maxAge: 86400
};

// Rate limiting configurations
export const createRateLimit = (windowMs: number, max: number, message: string) => {
  return rateLimit({
    windowMs,
    max,
    message: { error: message },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
      return req.ip + ':' + (req.headers['user-agent'] || 'unknown');
    },
    skip: (req) => {
      return req.path === '/health' || req.path === '/status';
    }
  });
};

export const globalRateLimit = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  100, // 100 requests per window
  'Too many requests from this IP'
);

export const authRateLimit = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  5, // 5 login attempts per window
  'Too many authentication attempts'
);

export const apiRateLimit = createRateLimit(
  60 * 1000, // 1 minute
  30, // 30 requests per minute
  'API rate limit exceeded'
);

// Progressive slowdown
export const progressiveSlowdown = slowDown({
  windowMs: 15 * 60 * 1000,
  delayAfter: 50,
  delayMs: 500,
  maxDelayMs: 20000,
});

// Security headers
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      scriptSrc: ["'self'", "'unsafe-eval'", "'unsafe-inline'"],
      connectSrc: ["'self'", "ws:", "wss:", "https:"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

// Input sanitization
export const sanitizeInput = (input: any): any => {
  if (typeof input === 'string') {
    return input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
               .replace(/javascript:/gi, '')
               .replace(/on\w+\s*=/gi, '')
               .trim();
  }
  
  if (Array.isArray(input)) {
    return input.map(sanitizeInput);
  }
  
  if (input && typeof input === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = sanitizeInput(value);
    }
    return sanitized;
  }
  
  return input;
};

export const sanitizeMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (req.body) {
    req.body = sanitizeInput(req.body);
  }
  
  if (req.query) {
    req.query = sanitizeInput(req.query);
  }
  
  next();
};

// Security monitoring
class SecurityMonitor {
  private suspiciousIPs = new Map<string, {
    requests: number;
    lastRequest: number;
    violations: string[];
  }>();
  
  private readonly MAX_REQUESTS_PER_SECOND = 10;
  private readonly VIOLATION_THRESHOLD = 5;

  trackRequest(ip: string): boolean {
    const now = Date.now();
    const ipData = this.suspiciousIPs.get(ip) || {
      requests: 0,
      lastRequest: now,
      violations: []
    };

    if (now - ipData.lastRequest > 1000) {
      ipData.requests = 0;
    }

    ipData.requests++;
    ipData.lastRequest = now;

    if (ipData.requests > this.MAX_REQUESTS_PER_SECOND) {
      ipData.violations.push(`High frequency: ${ipData.requests}/sec`);
    }

    this.suspiciousIPs.set(ip, ipData);
    return ipData.violations.length < this.VIOLATION_THRESHOLD;
  }

  isBlocked(ip: string): boolean {
    const ipData = this.suspiciousIPs.get(ip);
    return ipData ? ipData.violations.length >= this.VIOLATION_THRESHOLD : false;
  }
}

export const securityMonitor = new SecurityMonitor();

export const securityMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const ip = req.ip || 'unknown';

  if (securityMonitor.isBlocked(ip)) {
    return res.status(429).json({
      error: 'IP temporarily blocked due to suspicious activity'
    });
  }

  const allowed = securityMonitor.trackRequest(ip);
  
  if (!allowed) {
    return res.status(429).json({
      error: 'Rate limit exceeded - suspicious activity detected'
    });
  }

  next();
};

// Validation helpers
export const createValidationRules = (rules: any[]) => {
  return [
    ...rules,
    (req: express.Request, res: express.Response, next: express.NextFunction) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }
      next();
    }
  ];
};

export const walletValidation = body('walletAddress')
  .isLength({ min: 42, max: 42 })
  .matches(/^0x[a-fA-F0-9]{40}$/)
  .withMessage('Invalid wallet address format');

export const amountValidation = body('amount')
  .isFloat({ min: 0.000001 })
  .withMessage('Amount must be a positive number');

export const stringValidation = (field: string, minLength = 1, maxLength = 1000) =>
  body(field)
    .isLength({ min: minLength, max: maxLength })
    .trim()
    .escape()
    .withMessage(`${field} must be between ${minLength} and ${maxLength} characters`);