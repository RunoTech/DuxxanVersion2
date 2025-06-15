import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { db, pool } from "./db";
import { insertUserSchema, insertRaffleSchema, insertDonationSchema, insertTicketSchema, insertDonationContributionSchema, insertUserRatingSchema, donations, users } from "@shared/schema";
import { z } from "zod";
import { sql, eq, desc } from "drizzle-orm";
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { redis } from '../lib/redis';
import { firebase } from '../lib/firebase';
import {
  globalRateLimit,
  strictRateLimit,
  authRateLimit,
  createRateLimit,
  progressiveSlowdown,
  securityHeaders,
  securityMiddleware,
  requestSizeLimit,
  patternDetection,
  getSecurityStatus,
  csrfMiddleware,
  deviceFingerprintMiddleware,
  sanitizationMiddleware,
  validationMiddleware,
  walletValidation,
  amountValidation,
  textValidation,
  deviceInfoValidation,
  generateDeviceFingerprint,
  csrfProtection
} from "./security";
import { requestTimingMiddleware, healthCheckHandler, metricsHandler } from "../lib/monitoring";
import { 
  createRaffleSchema, 
  createDonationSchema, 
  purchaseTicketSchema,
  contributionSchema,
  chatMessageSchema,
  userRatingSchema,
  createValidationMiddleware
} from "../lib/validation/schemas";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Demo route moved to index.ts to bypass all middleware

  // Apply basic security headers and monitoring
  app.use(securityHeaders);
  app.use(requestSizeLimit);
  app.use(requestTimingMiddleware);
  
  // Health and monitoring endpoints
  app.get('/health', healthCheckHandler);
  app.get('/metrics', metricsHandler);
  app.get('/api/security/status', getSecurityStatus);
  
  // Authentication endpoints with JWT and device fingerprinting
  app.post('/api/auth/login', authRateLimit, walletValidation, deviceInfoValidation, validationMiddleware, async (req, res) => {
    try {
      const { walletAddress, deviceInfo } = req.body;
      
      // Get or create user
      let user = await storage.getUserByWalletAddress(walletAddress);
      if (!user) {
        user = await storage.createUser({ 
          walletAddress, 
          username: walletAddress.slice(0, 8),
          organizationType: 'individual'
        });
        
        // Store new user in Firebase
        try {
          await firebase.saveUserActivity(user.id, 'user_registration', {
            walletAddress: user.walletAddress,
            username: user.username,
            registrationTime: new Date().toISOString(),
            source: 'web_platform'
          });
        } catch (firebaseError) {
          console.warn('Firebase user creation failed:', firebaseError);
        }
      }
      
      // Generate device fingerprint
      const fingerprint = generateDeviceFingerprint(req, deviceInfo);
      
      // Create or update device record
      await storage.createUserDevice({
        userId: user.id,
        deviceType: deviceInfo?.deviceType || 'unknown',
        userAgent: fingerprint.userAgent,
        ipAddress: req.ip || 'unknown',
        deviceFingerprint: fingerprint.hash,
        acceptLanguage: fingerprint.acceptLanguage,
        acceptEncoding: fingerprint.acceptEncoding,
        timezone: fingerprint.timezone,
        screenResolution: fingerprint.screenResolution,
        colorDepth: fingerprint.colorDepth
      });
      
      // Store user session in Redis
      const sessionKey = `duxxan:user:${user.id}:session`;
      try {
        await redis.hset(sessionKey, 'userId', user.id.toString());
        await redis.hset(sessionKey, 'username', user.username || 'anonymous');
        await redis.hset(sessionKey, 'walletAddress', user.walletAddress);
        await redis.hset(sessionKey, 'lastLoginTime', new Date().toISOString());
        await redis.hset(sessionKey, 'deviceType', deviceInfo?.deviceType || 'unknown');
        await redis.hset(sessionKey, 'ipAddress', req.ip || 'unknown');
        await redis.hset(sessionKey, 'userAgent', fingerprint.userAgent);
        await redis.hset(sessionKey, 'status', 'active');
        await redis.hset(sessionKey, 'sessionId', crypto.randomBytes(16).toString('hex'));
        
        console.log(`User session stored in Redis: ${sessionKey}`);
      } catch (redisError) {
        console.warn('Redis session storage failed:', redisError);
      }
      
      // Log login activity in Firebase
      try {
        await firebase.saveUserActivity(user.id, 'user_login', {
          walletAddress: user.walletAddress,
          deviceType: deviceInfo?.deviceType || 'unknown',
          ipAddress: req.ip || 'unknown',
          deviceFingerprint: fingerprint.hash,
          loginTime: new Date().toISOString()
        });
      } catch (firebaseError) {
        console.warn('Firebase login logging failed:', firebaseError);
      }
      
      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: user.id, 
          walletAddress: user.walletAddress,
          deviceFingerprint: fingerprint.hash,
          sessionId: crypto.randomBytes(16).toString('hex')
        },
        process.env.JWT_SECRET || 'dev-secret',
        { expiresIn: '24h', issuer: 'duxxan', audience: 'duxxan-app' }
      );
      
      // Generate CSRF token
      const csrfToken = csrfProtection.generateToken(req.ip);
      
      res.json({
        token,
        csrfToken,
        user: {
          id: user.id,
          walletAddress: user.walletAddress,
          username: user.username,
          name: user.name
        },
        deviceFingerprint: fingerprint.hash,
        expiresIn: '24h'
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Authentication failed' });
    }
  });
  
  app.post('/api/auth/refresh', authRateLimit, async (req, res) => {
    try {
      const authHeader = req.get('Authorization');
      if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Invalid token format' });
      }
      
      const token = authHeader.slice(7);
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret') as any;
      
      // Verify user still exists
      const user = await storage.getUserByWalletAddress(decoded.walletAddress);
      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }
      
      // Generate new token
      const newToken = jwt.sign(
        { 
          userId: user.id, 
          walletAddress: user.walletAddress,
          deviceFingerprint: decoded.deviceFingerprint,
          sessionId: crypto.randomBytes(16).toString('hex')
        },
        process.env.JWT_SECRET || 'dev-secret',
        { expiresIn: '24h', issuer: 'duxxan', audience: 'duxxan-app' }
      );
      
      res.json({ token: newToken, expiresIn: '24h' });
    } catch (error) {
      res.status(401).json({ message: 'Token refresh failed' });
    }
  });
  
  app.post('/api/auth/logout', async (req, res) => {
    // In a production system, you'd blacklist the token
    res.json({ message: 'Logged out successfully' });
  });
  
  // Security endpoints
  app.post('/api/security/csrf-token', (req, res) => {
    const sessionId = (req as any).sessionID || req.ip;
    const token = csrfProtection.generateToken(sessionId);
    res.json({ csrfToken: token });
  });
  
  app.post('/api/security/device-fingerprint', deviceInfoValidation, validationMiddleware, (req, res) => {
    const fingerprint = generateDeviceFingerprint(req, req.body);
    res.json({ deviceFingerprint: fingerprint });
  });
  
  // Temporarily disabled aggressive protection to allow normal app functionality
  // app.use(patternDetection);

  // app.use(securityMiddleware);
  // app.use(progressiveSlowdown);
  // app.use(globalRateLimit); // Disabled for demo

  // WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  const clients = new Set<WebSocket>();
  
  wss.on('connection', (ws: WebSocket) => {
    clients.add(ws);
    console.log(`🔗 WebSocket connected. Total clients: ${clients.size}`);
    
    ws.on('close', () => {
      clients.delete(ws);
      console.log(`🔌 WebSocket disconnected. Total clients: ${clients.size}`);
    });
  });

  function broadcast(data: any) {
    const message = JSON.stringify(data);
    clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  // JWT Authentication middleware with device verification
  const authenticateUser = async (req: any, res: any, next: any) => {
    try {
      const authHeader = req.get('Authorization');
      const deviceId = req.get('X-Device-ID');
      
      if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Authentication token required' });
      }
      
      const token = authHeader.slice(7);
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret') as any;
      
      // Verify device fingerprint if provided
      if (deviceId && decoded.deviceFingerprint !== deviceId) {
        return res.status(401).json({ message: 'Device verification failed' });
      }
      
      // Get current user data
      const user = await storage.getUserByWalletAddress(decoded.walletAddress);
      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }
      
      req.user = user;
      req.deviceFingerprint = decoded.deviceFingerprint;
      req.sessionId = decoded.sessionId;
      next();
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        return res.status(401).json({ message: 'Invalid authentication token' });
      }
      if (error instanceof jwt.TokenExpiredError) {
        return res.status(401).json({ message: 'Authentication token expired' });
      }
      return res.status(500).json({ message: 'Authentication failed' });
    }
  };
  
  // Legacy fallback for existing endpoints (deprecated - use authenticateUser)
  const getUser = async (req: any, res: any, next: any) => {
    const walletAddress = req.headers['x-wallet-address'];
    if (!walletAddress) {
      return res.status(401).json({ message: 'Wallet address required' });
    }
    
    const user = await storage.getUserByWalletAddress(walletAddress);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    req.user = user;
    next();
  };

  // Initialize categories with aggressive caching
  app.get('/api/categories', async (req, res) => {
    try {
      // Cache for 30 minutes with stale-while-revalidate
      res.set('Cache-Control', 'public, max-age=1800, stale-while-revalidate=3600');
      
      const categories = await storage.getCategories();
      if (categories.length === 0) {
        const defaultCategories = [
          { id: 1, name: 'Cars', slug: 'cars' },
          { id: 2, name: 'Electronics', slug: 'electronics' },
          { id: 3, name: 'Jewelry', slug: 'jewelry' },
          { id: 4, name: 'Real Estate', slug: 'real-estate' },
          { id: 5, name: 'Art', slug: 'art' },
          { id: 6, name: 'Home', slug: 'home' },
        ];
        res.json(defaultCategories);
      } else {
        res.json(categories);
      }
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch categories' });
    }
  });

  // Platform stats with caching
  app.get('/api/stats', async (req, res) => {
    try {
      // Cache for 5 minutes with stale-while-revalidate
      res.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=600');
      
      const stats = await storage.getPlatformStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch stats' });
    }
  });

  // Security monitoring endpoint
  app.get('/api/security/status', strictRateLimit, (req, res) => {
    getSecurityStatus(req, res);
  });

  // User routes with authentication rate limiting
  app.post('/api/users', authRateLimit, async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existing = await storage.getUserByWalletAddress(userData.walletAddress);
      if (existing) {
        return res.json(existing);
      }
      
      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: 'Invalid user data', errors: error.errors });
      } else {
        res.status(500).json({ message: 'Failed to create user' });
      }
    }
  });

  app.get('/api/users/me', getUser, async (req: any, res) => {
    // Cache user data for 1 minute with stale-while-revalidate
    res.set('Cache-Control', 'private, max-age=60, stale-while-revalidate=120');
    res.json(req.user);
  });

  app.put('/api/users/me', getUser, async (req: any, res) => {
    try {
      const updates = insertUserSchema.partial().parse(req.body);
      const user = await storage.updateUser(req.user.id, updates);
      res.json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: 'Invalid user data', errors: error.errors });
      } else {
        res.status(500).json({ message: 'Failed to update user' });
      }
    }
  });

  // Raffle routes
  app.get('/api/raffles', async (req, res) => {
    try {
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 100); // Max 100 items
      const offset = Math.max(parseInt(req.query.offset as string) || 0, 0); // No negative offset
      
      if (isNaN(limit) || isNaN(offset)) {
        return res.status(400).json({ message: 'Invalid pagination parameters' });
      }
      
      const raffles = await storage.getRaffles(limit, offset);
      res.json(raffles);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch raffles' });
    }
  });

  app.get('/api/raffles/active', async (req, res) => {
    try {
      // Cache active raffles for 1 minute with stale-while-revalidate
      res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=120');
      
      const raffles = await storage.getActiveRaffles();
      res.json(raffles);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch active raffles' });
    }
  });

  app.get('/api/raffles/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id) || id <= 0) {
        return res.status(400).json({ message: 'Invalid raffle ID' });
      }
      
      const raffle = await storage.getRaffleById(id);
      if (!raffle) {
        return res.status(404).json({ message: 'Raffle not found' });
      }
      res.json(raffle);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch raffle' });
    }
  });

  app.post('/api/raffles', createRateLimit, getUser, async (req: any, res) => {
    try {
      // Check if user has created any donations (donation recipients cannot create raffles)
      const userDonations = await storage.getDonationsByCreator(req.user.id);
      if (userDonations.length > 0) {
        return res.status(403).json({ 
          message: 'Bağış alan hesaplar çekiliş oluşturamaz. Çekiliş yapmak için ayrı bir hesap kullanın.' 
        });
      }

      const raffleData = insertRaffleSchema.parse(req.body);
      const raffle = await storage.createRaffle({ ...raffleData, creatorId: req.user.id });
      
      // Store raffle in Redis for real-time tracking
      const raffleKey = `duxxan:raffle:${raffle.id}:live_stats`;
      try {
        await redis.hset(raffleKey, 'raffleId', raffle.id.toString());
        await redis.hset(raffleKey, 'title', raffle.title);
        await redis.hset(raffleKey, 'prizeAmount', raffle.prizeAmount || '0');
        await redis.hset(raffleKey, 'ticketPrice', raffle.ticketPrice || '0');
        await redis.hset(raffleKey, 'maxTickets', raffle.maxTickets?.toString() || '0');
        await redis.hset(raffleKey, 'totalTickets', '0');
        await redis.hset(raffleKey, 'status', 'active');
        await redis.hset(raffleKey, 'createdAt', new Date().toISOString());
        await redis.hset(raffleKey, 'creatorId', raffle.creatorId.toString());
        
        console.log(`Raffle stored in Redis: ${raffleKey}`);
      } catch (redisError) {
        console.warn('Redis raffle storage failed:', redisError);
      }
      
      // Log raffle creation in Firebase
      try {
        await firebase.saveRaffleEvent(raffle.id, 'raffle_created', {
          title: raffle.title,
          prizeAmount: raffle.prizeAmount,
          creatorId: raffle.creatorId,
          categoryId: raffle.categoryId,
          createdAt: new Date().toISOString()
        });
      } catch (firebaseError) {
        console.warn('Firebase raffle logging failed:', firebaseError);
      }
      
      broadcast({ type: 'RAFFLE_CREATED', data: raffle });
      res.status(201).json(raffle);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: 'Invalid raffle data', errors: error.errors });
      } else {
        res.status(500).json({ message: 'Failed to create raffle' });
      }
    }
  });

  app.put('/api/raffles/:id/approve', strictRateLimit, getUser, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const raffle = await storage.getRaffleById(id);
      
      if (!raffle) {
        return res.status(404).json({ message: 'Raffle not found' });
      }

      let updates: any = {};
      if (raffle.creatorId === req.user.id) {
        updates.isApprovedByCreator = true;
      } else if (raffle.winnerId === req.user.id) {
        updates.isApprovedByWinner = true;
      } else {
        return res.status(403).json({ message: 'Not authorized to approve this raffle' });
      }

      const updatedRaffle = await storage.updateRaffle(id, updates);
      broadcast({ type: 'RAFFLE_APPROVED', data: updatedRaffle });
      
      res.json(updatedRaffle);
    } catch (error) {
      res.status(500).json({ message: 'Failed to approve raffle' });
    }
  });

  // Ticket routes
  app.post('/api/tickets', strictRateLimit, getUser, async (req: any, res) => {
    try {
      const ticketData = insertTicketSchema.parse(req.body);
      const ticket = await storage.createTicket({ ...ticketData, userId: req.user.id });
      
      // Update raffle stats in Redis
      const raffleKey = `duxxan:raffle:${ticket.raffleId}:live_stats`;
      try {
        const currentTickets = await redis.hget(raffleKey, 'totalTickets');
        const newTotal = (parseInt(currentTickets || '0') + ticket.quantity).toString();
        await redis.hset(raffleKey, 'totalTickets', newTotal);
        await redis.hset(raffleKey, 'lastTicketPurchase', new Date().toISOString());
        
        console.log(`Raffle ${ticket.raffleId} tickets updated in Redis: ${newTotal}`);
      } catch (redisError) {
        console.warn('Redis ticket update failed:', redisError);
      }
      
      // Log ticket purchase in Firebase
      try {
        await firebase.saveRaffleEvent(ticket.raffleId, 'ticket_purchased', {
          userId: req.user.id,
          quantity: ticket.quantity,
          totalPrice: ticket.totalPrice,
          purchaseTime: new Date().toISOString()
        });
      } catch (firebaseError) {
        console.warn('Firebase ticket logging failed:', firebaseError);
      }
      
      broadcast({ type: 'TICKET_PURCHASED', data: { raffleId: ticket.raffleId, quantity: ticket.quantity } });
      res.status(201).json(ticket);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: 'Invalid ticket data', errors: error.errors });
      } else {
        res.status(500).json({ message: 'Failed to purchase ticket' });
      }
    }
  });

  app.get('/api/raffles/:id/tickets', async (req, res) => {
    try {
      const raffleId = parseInt(req.params.id);
      const tickets = await storage.getTicketsByRaffle(raffleId);
      res.json(tickets);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch tickets' });
    }
  });

  app.get('/api/users/me/tickets', getUser, async (req: any, res) => {
    try {
      const tickets = await storage.getTicketsByUser(req.user.id);
      res.json(tickets);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch user tickets' });
    }
  });

  // Donation routes
  app.get('/api/donations', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      const donations = await storage.getDonations(limit, offset);
      res.json(donations);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch donations' });
    }
  });

  app.get('/api/donations/active', async (req, res) => {
    try {
      // Cache active donations for 1 minute with stale-while-revalidate
      res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=120');
      
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      
      // Direct implementation using working database pattern
      const result = await db
        .select({
          donation: donations,
          creator: users,
        })
        .from(donations)
        .innerJoin(users, eq(donations.creatorId, users.id))
        .orderBy(desc(donations.createdAt))
        .limit(limit)
        .offset(offset);
      
      const allDonations = result.map(row => ({ ...row.donation, creator: row.creator }));
      const activeDonations = allDonations.filter(d => d.isActive === true);
      res.json(activeDonations);
    } catch (error) {
      console.error('Donations active API error:', error);
      res.status(500).json({ message: 'Failed to fetch donations' });
    }
  });

  app.get('/api/donations/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const donation = await storage.getDonationById(id);
      if (!donation) {
        return res.status(404).json({ message: 'Donation not found' });
      }
      res.json(donation);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch donation' });
    }
  });

  app.post('/api/donations', createRateLimit, getUser, async (req: any, res) => {
    try {
      const donationData = insertDonationSchema.parse(req.body);
      const donation = await storage.createDonation({ ...donationData, creatorId: req.user.id });
      
      broadcast({ type: 'DONATION_CREATED', data: donation });
      res.status(201).json(donation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: 'Invalid donation data', errors: error.errors });
      } else {
        res.status(500).json({ message: 'Failed to create donation' });
      }
    }
  });

  // Donation contribution routes
  app.post('/api/donations/:id/contribute', strictRateLimit, getUser, async (req: any, res) => {
    try {
      const donationId = parseInt(req.params.id);
      const contributionData = insertDonationContributionSchema.parse({ ...req.body, donationId });
      const contribution = await storage.createDonationContribution({ ...contributionData, userId: req.user.id });
      
      broadcast({ type: 'DONATION_CONTRIBUTION', data: { donationId, amount: contribution.amount } });
      res.status(201).json(contribution);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: 'Invalid contribution data', errors: error.errors });
      } else {
        res.status(500).json({ message: 'Failed to contribute to donation' });
      }
    }
  });

  app.get('/api/donations/:id/contributions', async (req, res) => {
    try {
      const donationId = parseInt(req.params.id);
      const contributions = await storage.getDonationContributions(donationId);
      res.json(contributions);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch contributions' });
    }
  });

  // Rating routes
  app.post('/api/users/:id/rate', getUser, async (req: any, res) => {
    try {
      const ratedId = parseInt(req.params.id);
      const ratingData = insertUserRatingSchema.parse({ ...req.body, ratedId });
      const rating = await storage.createUserRating({ ...ratingData, raterId: req.user.id });
      
      res.status(201).json(rating);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: 'Invalid rating data', errors: error.errors });
      } else {
        res.status(500).json({ message: 'Failed to create rating' });
      }
    }
  });

  // Chat routes moved to index.ts to bypass authentication middleware



  // User device logging routes
  app.post('/api/users/me/devices', getUser, async (req: any, res) => {
    try {
      const deviceInfo = {
        ...req.body,
        userId: req.user.id,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'] || '',
      };

      const device = await storage.createUserDevice(deviceInfo);
      res.json(device);
    } catch (error) {
      res.status(500).json({ message: 'Failed to log device' });
    }
  });

  app.get('/api/users/me/devices', getUser, async (req: any, res) => {
    try {
      const devices = await storage.getUserDevices(req.user.id);
      res.json(devices);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch devices' });
    }
  });

  // User photo routes
  app.post('/api/users/me/photos', getUser, async (req: any, res) => {
    try {
      const photoData = {
        ...req.body,
        userId: req.user.id,
      };

      const photo = await storage.createUserPhoto(photoData);
      res.json(photo);
    } catch (error) {
      res.status(500).json({ message: 'Failed to upload photo' });
    }
  });

  app.get('/api/users/me/photos', getUser, async (req: any, res) => {
    try {
      const photoType = req.query.type as string;
      const photos = await storage.getUserPhotos(req.user.id, photoType);
      res.json(photos);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch photos' });
    }
  });

  app.delete('/api/users/me/photos/:id', getUser, async (req: any, res) => {
    try {
      const photoId = parseInt(req.params.id);
      await storage.deleteUserPhoto(photoId, req.user.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete photo' });
    }
  });

  // Countries API endpoints for international filtering
  app.get('/api/countries', async (req, res) => {
    try {
      // Cache for 1 hour - countries data rarely changes
      res.set('Cache-Control', 'public, max-age=3600');
      
      const countries = await storage.getCountries();
      res.json(countries);
    } catch (error: any) {
      res.status(500).json({ message: 'Failed to fetch countries: ' + error.message });
    }
  });

  app.get('/api/countries/:code', async (req, res) => {
    try {
      const country = await storage.getCountryByCode(req.params.code);
      if (!country) {
        return res.status(404).json({ message: 'Country not found' });
      }
      res.json(country);
    } catch (error: any) {
      res.status(500).json({ message: 'Failed to fetch country: ' + error.message });
    }
  });

  // Test Firebase endpoint
  app.get('/api/test-firebase', async (req, res) => {
    try {
      const { testFirebaseManually } = await import('./firebase-manual-test');
      const result = await testFirebaseManually();
      res.json({ success: true, result });
    } catch (error: any) {
      console.error('Firebase test error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  return httpServer;
}
