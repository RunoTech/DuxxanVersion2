import express, { type Request, Response, NextFunction } from "express";
import cors from "cors";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { 
  corsOptions, 
  globalRateLimit, 
  securityHeaders, 
  securityMiddleware,
  sanitizationMiddleware,
  deviceFingerprintMiddleware,
  requestSizeLimit,
  patternDetection
} from "./security";

const app = express();
app.set('trust proxy', 1); // Trust first proxy for accurate IP detection

// Apply security middleware first
app.use(cors(corsOptions));
app.use(securityHeaders);
app.use(globalRateLimit);
app.use(requestSizeLimit);
app.use(patternDetection);
app.use(securityMiddleware);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// Apply sanitization and device fingerprinting
app.use(sanitizationMiddleware);
app.use(deviceFingerprintMiddleware);

app.post('/api/raffles/:id/assign-winner', async (req: any, res) => {
  try {
    console.log('Demo winner assignment request received', req.body);
    const raffleId = parseInt(req.params.id);
    // Ignore winnerId from request body, always use user ID 1 for demo

    // Import storage here to avoid circular dependency
    const { storage } = await import('./storage');
    
    const raffle = await storage.getRaffleById(raffleId);
    
    if (!raffle) {
      return res.status(404).json({ message: 'Raffle not found' });
    }

    // Use existing user ID 1 as demo winner
    const updatedRaffle = await storage.updateRaffle(raffleId, { winnerId: 1 });
    console.log(`Winner assigned: Raffle ${raffleId}, Winner ID: 1 (TechMaster2024)`);

    res.json({ message: 'Winner assigned successfully', raffle: updatedRaffle });
  } catch (error: any) {
    console.error('Winner assignment error:', error);
    res.status(500).json({ message: 'Failed to assign winner', error: error.message });
  }
});

// Mutual approval routes BEFORE any middleware
app.post('/api/raffles/:id/approve-winner', async (req: any, res) => {
  try {
    const raffleId = parseInt(req.params.id);
    const { storage } = await import('./storage');
    
    const raffle = await storage.getRaffleById(raffleId);
    
    if (!raffle) {
      return res.status(404).json({ message: 'Raffle not found' });
    }

    if (!raffle.winnerId) {
      return res.status(400).json({ message: 'No winner assigned yet' });
    }

    // For demo: Approve as creator (organization)
    const updatedRaffle = await storage.updateRaffle(raffleId, { 
      isApprovedByCreator: true 
    });

    console.log(`Creator approved raffle ${raffleId}`);
    res.json({ message: 'Approved by creator', raffle: updatedRaffle });
  } catch (error) {
    console.error('Creator approval error:', error);
    res.status(500).json({ message: 'Failed to approve by creator' });
  }
});

app.post('/api/raffles/:id/approve-creator', async (req: any, res) => {
  try {
    const raffleId = parseInt(req.params.id);
    const { storage } = await import('./storage');
    
    const raffle = await storage.getRaffleById(raffleId);
    
    if (!raffle) {
      return res.status(404).json({ message: 'Raffle not found' });
    }

    if (!raffle.winnerId) {
      return res.status(400).json({ message: 'No winner assigned yet' });
    }

    // For demo: Approve as winner
    const updatedRaffle = await storage.updateRaffle(raffleId, { 
      isApprovedByWinner: true 
    });

    console.log(`Winner approved raffle ${raffleId}`);
    res.json({ message: 'Approved by winner', raffle: updatedRaffle });
  } catch (error) {
    console.error('Winner approval error:', error);
    res.status(500).json({ message: 'Failed to approve by winner' });
  }
});

// Chat routes BEFORE any middleware
app.get('/api/raffles/:id/chat', async (req: any, res) => {
  try {
    const raffleId = parseInt(req.params.id);
    const { storage } = await import('./storage');
    
    const raffle = await storage.getRaffleById(raffleId);
    
    if (!raffle) {
      return res.status(404).json({ message: 'Raffle not found' });
    }

    if (!raffle.winnerId) {
      return res.status(400).json({ message: 'Chat not available until winner is announced' });
    }

    const messages = await storage.getChatMessages(raffleId);
    res.json(messages);
  } catch (error) {
    console.error('Chat fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch chat messages', error: error.message });
  }
});

app.post('/api/raffles/:id/chat', async (req: any, res) => {
  try {
    const raffleId = parseInt(req.params.id);
    const { message } = req.body;
    const { storage } = await import('./storage');

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ message: 'Message is required' });
    }

    if (message.length > 1000) {
      return res.status(400).json({ message: 'Message too long (max 1000 characters)' });
    }

    const raffle = await storage.getRaffleById(raffleId);
    
    if (!raffle) {
      return res.status(404).json({ message: 'Raffle not found' });
    }

    if (!raffle.winnerId) {
      return res.status(400).json({ message: 'Chat not available until winner is announced' });
    }

    const senderId = 1; // Demo winner (TechMaster2024)
    const receiverId = raffle.creatorId;

    const chatMessage = await storage.createChatMessage({
      raffleId,
      senderId,
      receiverId,
      message: message.trim()
    });

    console.log('Chat message sent:', chatMessage);
    res.status(201).json(chatMessage);
  } catch (error) {
    console.error('Chat message error:', error);
    res.status(500).json({ message: 'Failed to send message' });
  }
});

// Remove duplicate middleware - already defined above

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Register routes but skip the demo route since it's already defined
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
