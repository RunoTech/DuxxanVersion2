import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { db, pool } from "./db";
import { insertUserSchema, insertRaffleSchema, insertDonationSchema, insertTicketSchema, insertDonationContributionSchema, insertUserRatingSchema, donations, users } from "@shared/schema";
import { z } from "zod";
import { sql, eq, desc } from "drizzle-orm";
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
  getSecurityStatus
} from "./security";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Apply basic security headers only (DDoS protection temporarily reduced)
  app.use(securityHeaders);
  app.use(requestSizeLimit);
  // Temporarily disabled aggressive protection to allow normal app functionality
  // app.use(patternDetection);
  // app.use(securityMiddleware);
  // app.use(progressiveSlowdown);
  app.use(globalRateLimit);

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

  // Middleware to get user from wallet address
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

  // Initialize categories
  app.get('/api/categories', async (req, res) => {
    try {
      // Create default categories if they don't exist
      const categories = await storage.getCategories();
      if (categories.length === 0) {
        // This would typically be done via database seeding
        // For now, return hardcoded categories
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

  // Platform stats
  app.get('/api/stats', async (req, res) => {
    try {
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

  // Chat routes
  app.get('/api/raffles/:id/chat', getUser, async (req: any, res) => {
    try {
      const raffleId = parseInt(req.params.id);
      const messages = await storage.getChatMessages(raffleId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch chat messages' });
    }
  });

  app.post('/api/raffles/:id/chat', getUser, async (req: any, res) => {
    try {
      const raffleId = parseInt(req.params.id);
      const { receiverId, message } = req.body;
      
      const chatMessage = await storage.createChatMessage({
        raffleId,
        senderId: req.user.id,
        receiverId,
        message,
      });
      
      broadcast({ type: 'CHAT_MESSAGE', data: chatMessage });
      res.status(201).json(chatMessage);
    } catch (error) {
      res.status(500).json({ message: 'Failed to send message' });
    }
  });

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

  return httpServer;
}
