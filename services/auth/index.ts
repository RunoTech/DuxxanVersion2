import express from 'express';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { body, validationResult } from 'express-validator';
import crypto from 'crypto';

const app = express();
app.use(express.json());

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: 'Too many authentication attempts',
  standardHeaders: true,
  legacyHeaders: false,
});

// JWT secret from environment
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface AuthUser {
  id: number;
  walletAddress: string;
  deviceId: string;
  origin: string;
}

// Generate device fingerprint
function generateDeviceFingerprint(userAgent: string, ip: string): string {
  return crypto.createHash('sha256')
    .update(`${userAgent}${ip}`)
    .digest('hex');
}

// Validate wallet signature
function validateWalletSignature(walletAddress: string, signature: string, message: string): boolean {
  // Implement actual wallet signature validation
  // This is a placeholder for real crypto signature verification
  return signature.length > 0;
}

// Generate nonce for request validation
function generateNonce(): string {
  return crypto.randomBytes(16).toString('hex');
}

// Login endpoint
app.post('/auth/login', 
  authLimiter,
  [
    body('walletAddress').isLength({ min: 42, max: 42 }).matches(/^0x[a-fA-F0-9]{40}$/),
    body('signature').notEmpty(),
    body('message').notEmpty(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { walletAddress, signature, message } = req.body;
      const userAgent = req.get('User-Agent') || '';
      const ip = req.ip || req.connection.remoteAddress || '';
      
      // Validate wallet signature
      if (!validateWalletSignature(walletAddress, signature, message)) {
        return res.status(401).json({ error: 'Invalid signature' });
      }

      // Generate device fingerprint
      const deviceId = generateDeviceFingerprint(userAgent, ip);
      const origin = req.get('Origin') || '';

      // Generate JWT token
      const token = jwt.sign({
        walletAddress,
        deviceId,
        origin,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
        nonce: generateNonce()
      }, JWT_SECRET);

      res.json({
        token,
        user: {
          walletAddress,
          deviceId
        }
      });
    } catch (error) {
      console.error('Auth login error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Token validation endpoint
app.post('/auth/validate', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    // Additional security checks
    const userAgent = req.get('User-Agent') || '';
    const ip = req.ip || req.connection.remoteAddress || '';
    const currentDeviceId = generateDeviceFingerprint(userAgent, ip);
    
    if (decoded.deviceId !== currentDeviceId) {
      return res.status(401).json({ error: 'Device mismatch' });
    }

    res.json({ 
      valid: true, 
      user: {
        walletAddress: decoded.walletAddress,
        deviceId: decoded.deviceId
      }
    });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Logout endpoint
app.post('/auth/logout', async (req, res) => {
  // In a real implementation, you'd add the token to a blacklist
  res.json({ message: 'Logged out successfully' });
});

const PORT = process.env.AUTH_PORT || 3001;
app.listen(PORT, () => {
  console.log(`Auth service running on port ${PORT}`);
});

export default app;