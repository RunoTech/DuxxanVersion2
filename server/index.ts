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
} from "./middleware/security";
import { languageDetectionMiddleware, translationHeadersMiddleware } from "./middleware/translation";
import apiRoutes from "./routes/index";

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

// Apply translation middleware
app.use(languageDetectionMiddleware);
app.use(translationHeadersMiddleware);

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

// Health check route for testing
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    port: 5000,
    environment: process.env.NODE_ENV || 'development'
  });
});

// Simple HTML test route
app.get('/test', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>DUXXAN Platform</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .status { color: green; }
        .error { color: red; }
      </style>
    </head>
    <body>
      <h1>DUXXAN Platform Test</h1>
      <div id="status">Testing connection...</div>
      <div id="api-status">API Status: <span id="api-result">Loading...</span></div>
      
      <script>
        // Test API connection
        fetch('/api/stats')
          .then(res => res.json())
          .then(data => {
            document.getElementById('api-result').innerHTML = '<span class="status">Connected ✓</span>';
            document.getElementById('status').innerHTML = '<span class="status">All systems operational</span>';
            console.log('API Data:', data);
          })
          .catch(err => {
            document.getElementById('api-result').innerHTML = '<span class="error">Failed ✗</span>';
            document.getElementById('status').innerHTML = '<span class="error">Connection failed</span>';
            console.error('API Error:', err);
          });
      </script>
    </body>
    </html>
  `);
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
  } catch (error: any) {
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

// Add controller-based API routes
app.use('/api', apiRoutes);

(async () => {
  // Register routes but skip the demo route since it's already defined
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // Add fallback route for React app before Vite setup
  app.get('/', (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>DUXXAN Platform</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .container {
              background: white;
              padding: 2rem;
              border-radius: 1rem;
              box-shadow: 0 20px 40px rgba(0,0,0,0.1);
              text-align: center;
              max-width: 500px;
              width: 90%;
            }
            .logo { font-size: 2.5rem; font-weight: bold; color: #667eea; margin-bottom: 1rem; }
            .status { color: #059669; margin: 1rem 0; }
            .loading { animation: pulse 2s infinite; }
            @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
            .button {
              background: #667eea;
              color: white;
              padding: 0.75rem 1.5rem;
              border: none;
              border-radius: 0.5rem;
              cursor: pointer;
              margin: 0.5rem;
              text-decoration: none;
              display: inline-block;
            }
            .api-status { margin-top: 1rem; padding: 1rem; background: #f3f4f6; border-radius: 0.5rem; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">DUXXAN</div>
            <div class="loading">Platform Yükleniyor...</div>
            <div class="status" id="status">Bağlantı kontrol ediliyor...</div>
            
            <div class="api-status">
              <div>API Durumu: <span id="api-result">Test ediliyor...</span></div>
              <div>WebSocket: <span id="ws-result">Bağlanıyor...</span></div>
            </div>
            
            <div style="margin-top: 1.5rem;">
              <a href="/test" class="button">Test Sayfası</a>
              <a href="/health" class="button">Sistem Durumu</a>
            </div>
            
            <script>
              // API test
              fetch('/api/stats')
                .then(res => res.json())
                .then(data => {
                  document.getElementById('api-result').innerHTML = '✅ Çalışıyor';
                  document.getElementById('status').innerHTML = 'API bağlantısı başarılı';
                  console.log('API Data:', data);
                })
                .catch(err => {
                  document.getElementById('api-result').innerHTML = '❌ Hata';
                  console.error('API Error:', err);
                });
              
              // WebSocket test
              const wsProtocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
              const ws = new WebSocket(wsProtocol + '//' + location.host);
              
              ws.onopen = () => {
                document.getElementById('ws-result').innerHTML = '✅ Bağlı';
              };
              
              ws.onerror = () => {
                document.getElementById('ws-result').innerHTML = '❌ Bağlantı hatası';
              };
              
              // Auto refresh every 10 seconds to check for updates
              setTimeout(() => {
                window.location.reload();
              }, 10000);
            </script>
          </div>
        </body>
      </html>
    `);
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
  server.listen(port, "0.0.0.0", () => {
    log(`serving on port ${port}`);
    log('DUXXAN server running with controller-based architecture');
    
    // Test server connectivity
    setTimeout(async () => {
      try {
        const response = await fetch(`http://localhost:${port}/api/stats`);
        log(`Server health check: ${response.status}`);
      } catch (err: any) {
        log(`Server connectivity issue: ${err.message}`);
      }
    }, 2000);
  });
  
  server.on('error', (err: any) => {
    log(`Server error: ${err.message}`);
  });
})();
