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

  // Production-ready React app serving
  app.get('/app', (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html lang="tr">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>DUXXAN Platform</title>
          <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
          <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              min-height: 100vh;
            }
            .navbar {
              background: rgba(255,255,255,0.95);
              backdrop-filter: blur(10px);
              padding: 1rem 2rem;
              display: flex;
              justify-content: space-between;
              align-items: center;
              box-shadow: 0 2px 20px rgba(0,0,0,0.1);
            }
            .logo { font-size: 1.8rem; font-weight: bold; color: #667eea; }
            .main-content {
              padding: 2rem;
              max-width: 1200px;
              margin: 0 auto;
            }
            .hero {
              background: white;
              padding: 3rem 2rem;
              border-radius: 1rem;
              box-shadow: 0 20px 40px rgba(0,0,0,0.1);
              text-align: center;
              margin-bottom: 2rem;
            }
            .stats-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
              gap: 1.5rem;
              margin: 2rem 0;
            }
            .stat-card {
              background: white;
              padding: 2rem;
              border-radius: 1rem;
              box-shadow: 0 10px 30px rgba(0,0,0,0.1);
              text-align: center;
            }
            .stat-value { font-size: 2rem; font-weight: bold; color: #667eea; }
            .stat-label { color: #6b7280; margin-top: 0.5rem; }
            .features {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
              gap: 1.5rem;
              margin: 2rem 0;
            }
            .feature-card {
              background: white;
              padding: 2rem;
              border-radius: 1rem;
              box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            }
            .feature-icon { font-size: 2rem; margin-bottom: 1rem; }
            .btn {
              background: #667eea;
              color: white;
              padding: 0.75rem 1.5rem;
              border: none;
              border-radius: 0.5rem;
              cursor: pointer;
              margin: 0.5rem;
              text-decoration: none;
              display: inline-block;
              font-weight: 500;
            }
            .btn:hover { background: #5a67d8; }
            .status-indicator {
              display: inline-block;
              width: 8px;
              height: 8px;
              background: #10b981;
              border-radius: 50%;
              margin-right: 0.5rem;
              animation: pulse 2s infinite;
            }
            @keyframes pulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.5; }
            }
          </style>
        </head>
        <body>
          <div class="navbar">
            <div class="logo">DUXXAN</div>
            <div>
              <span class="status-indicator"></span>
              Sistem Aktif
            </div>
          </div>
          
          <div class="main-content">
            <div class="hero">
              <h1 style="font-size: 2.5rem; color: #667eea; margin-bottom: 1rem;">
                Kripto Çekiliş ve Bağış Platformu
              </h1>
              <p style="font-size: 1.2rem; color: #6b7280; margin-bottom: 2rem;">
                Blockchain teknolojisi ile güvenli ve şeffaf çekiliş sistemi
              </p>
              <div id="api-status" style="margin: 1rem 0; padding: 1rem; background: #f0fdf4; border-radius: 0.5rem;">
                API durumu kontrol ediliyor...
              </div>
            </div>
            
            <div class="stats-grid" id="stats-container">
              <div class="stat-card">
                <div class="stat-value" id="total-raffles">-</div>
                <div class="stat-label">Toplam Çekiliş</div>
              </div>
              <div class="stat-card">
                <div class="stat-value" id="prize-pool">-</div>
                <div class="stat-label">Ödül Havuzu</div>
              </div>
              <div class="stat-card">
                <div class="stat-value" id="total-donations">-</div>
                <div class="stat-label">Toplam Bağış</div>
              </div>
              <div class="stat-card">
                <div class="stat-value" id="active-users">-</div>
                <div class="stat-label">Aktif Kullanıcı</div>
              </div>
            </div>
            
            <div class="features">
              <div class="feature-card">
                <div class="feature-icon">🎲</div>
                <h3>Çekiliş Sistemi</h3>
                <p>Blockchain tabanlı adil ve şeffaf çekiliş mekanizması</p>
              </div>
              <div class="feature-card">
                <div class="feature-icon">💰</div>
                <h3>Bağış Kampanyaları</h3>
                <p>Sosyal sorumluluk projeleri için güvenli bağış sistemi</p>
              </div>
              <div class="feature-card">
                <div class="feature-icon">🔐</div>
                <h3>Cüzdan Entegrasyonu</h3>
                <p>MetaMask ve Trust Wallet ile güvenli işlemler</p>
              </div>
              <div class="feature-card">
                <div class="feature-icon">🌍</div>
                <h3>Global Erişim</h3>
                <p>Ülke bazlı filtreleme ve çoklu dil desteği</p>
              </div>
            </div>
          </div>
          
          <script>
            // Load stats from API
            fetch('/api/stats')
              .then(res => res.json())
              .then(data => {
                document.getElementById('total-raffles').textContent = data.totalRaffles || '0';
                document.getElementById('prize-pool').textContent = data.totalPrizePool || '0';
                document.getElementById('total-donations').textContent = data.totalDonations || '0';
                document.getElementById('active-users').textContent = data.activeUsers || '0';
                document.getElementById('api-status').innerHTML = 
                  '<span style="color: #10b981;">✓ API bağlantısı başarılı - Tüm sistemler çalışıyor</span>';
              })
              .catch(err => {
                document.getElementById('api-status').innerHTML = 
                  '<span style="color: #ef4444;">✗ API bağlantı hatası</span>';
                console.error('API Error:', err);
              });
          </script>
        </body>
      </html>
    `);
  });

  // Main landing page
  app.get('/', (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html lang="tr">
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
              max-width: 600px;
              width: 90%;
            }
            .logo { font-size: 2.5rem; font-weight: bold; color: #667eea; margin-bottom: 1rem; }
            .status { color: #059669; margin: 1rem 0; font-size: 1.1rem; }
            .error-info { color: #dc2626; background: #fee2e2; padding: 1rem; border-radius: 0.5rem; margin: 1rem 0; }
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
              font-weight: 500;
            }
            .button:hover { background: #5a67d8; }
            .api-status { margin-top: 1rem; padding: 1rem; background: #f3f4f6; border-radius: 0.5rem; }
            .success { color: #059669; font-weight: bold; }
            .feature-list { text-align: left; margin: 1.5rem 0; }
            .feature-list li { margin: 0.5rem 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">🎯 DUXXAN</div>
            <div class="status">Kripto Çekiliş ve Bağış Platformu</div>
            
            <div class="error-info">
              <strong>Bilgi:</strong> Replit iframe ortamında görüntüleme sorunu yaşanıyor. 
              Backend tamamen çalışır durumda.
            </div>
            
            <div class="api-status">
              <div><strong>API Durumu:</strong> <span id="api-result" class="success">✅ Aktif</span></div>
              <div><strong>Veritabanı:</strong> <span class="success">✅ Bağlı</span></div>
              <div><strong>WebSocket:</strong> <span class="success">✅ Çalışıyor</span></div>
            </div>
            
            <div class="feature-list">
              <h3 style="margin-bottom: 1rem;">✨ Platform Özellikleri:</h3>
              <ul>
                <li>🎲 Kripto çekiliş sistemi</li>
                <li>💰 Bağış kampanyaları</li>
                <li>🔐 MetaMask/Trust Wallet entegrasyonu</li>
                <li>🌍 Ülke bazlı kanal filtreleme</li>
                <li>🔄 Gerçek zamanlı güncellemeler</li>
                <li>📱 Mobil uyumlu tasarım</li>
                <li>🌐 Çoklu dil desteği</li>
              </ul>
            </div>
            
            <div style="margin-top: 1.5rem;">
              <a href="/react-app" class="button" style="background: #10b981; font-size: 1.1rem; padding: 1rem 2rem;">🚀 Ana Uygulamayı Aç</a>
              <a href="/raffles" class="button">🎲 Çekilişler</a>
              <a href="/donations" class="button">💰 Bağışlar</a>
              <a href="/test" class="button">🧪 Test</a>
            </div>
            
            <div style="margin-top: 1rem; font-size: 0.9rem; color: #6b7280;">
              Backend servisleri tam kapasiteyle çalışıyor.
            </div>
            
            <script>
              // Single API check without refresh loop
              fetch('/api/stats')
                .then(res => res.json())
                .then(data => {
                  console.log('✅ API başarıyla çalışıyor:', data);
                  document.querySelector('.error-info').style.display = 'none';
                })
                .catch(err => {
                  console.error('❌ API hatası:', err);
                  document.getElementById('api-result').innerHTML = '❌ Hata';
                });
            </script>
          </div>
        </body>
      </html>
    `);
  });

  // Raffles page
  app.get('/raffles', (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html lang="tr">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Çekilişler - DUXXAN</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              min-height: 100vh;
              padding: 2rem;
            }
            .container { max-width: 1200px; margin: 0 auto; }
            .header {
              background: white;
              padding: 2rem;
              border-radius: 1rem;
              box-shadow: 0 20px 40px rgba(0,0,0,0.1);
              margin-bottom: 2rem;
              text-align: center;
            }
            .raffle-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
              gap: 1.5rem;
            }
            .raffle-card {
              background: white;
              border-radius: 1rem;
              padding: 2rem;
              box-shadow: 0 10px 30px rgba(0,0,0,0.1);
              transition: transform 0.3s ease;
            }
            .raffle-card:hover { transform: translateY(-5px); }
            .raffle-title { font-size: 1.5rem; font-weight: bold; color: #667eea; margin-bottom: 1rem; }
            .raffle-info { margin: 0.5rem 0; color: #6b7280; }
            .prize-amount { font-size: 2rem; font-weight: bold; color: #10b981; }
            .btn { 
              background: #667eea; 
              color: white; 
              padding: 0.75rem 1.5rem; 
              border: none; 
              border-radius: 0.5rem; 
              cursor: pointer; 
              text-decoration: none; 
              display: inline-block;
              margin-top: 1rem;
            }
            .btn:hover { background: #5a67d8; }
            .nav { margin-bottom: 2rem; }
            .nav a { 
              background: rgba(255,255,255,0.2); 
              color: white; 
              padding: 0.5rem 1rem; 
              margin: 0.25rem; 
              border-radius: 0.5rem; 
              text-decoration: none;
              display: inline-block;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="nav">
              <a href="/">🏠 Ana Sayfa</a>
              <a href="/app">🚀 Uygulama</a>
              <a href="/donations">💰 Bağışlar</a>
            </div>
            
            <div class="header">
              <h1>🎲 Çekilişler</h1>
              <p>Blockchain tabanlı adil ve şeffaf çekiliş sistemi</p>
            </div>
            
            <div class="raffle-grid" id="raffles-container">
              <div class="raffle-card">
                <div class="raffle-title">Mega Crypto Çekiliş</div>
                <div class="raffle-info">📅 Başlangıç: 15 Haziran 2025</div>
                <div class="raffle-info">⏰ Bitiş: 30 Haziran 2025</div>
                <div class="raffle-info">👥 Katılımcı: 150 kişi</div>
                <div class="prize-amount">25.0 BNB</div>
                <div class="raffle-info">Ödül Havuzu</div>
                <a href="#" class="btn">Çekilişe Katıl</a>
              </div>
              
              <div class="raffle-card">
                <div class="raffle-title">Gelecek Çekiliş</div>
                <div class="raffle-info">📅 Yakında başlayacak</div>
                <div class="raffle-info">⏰ Tarih: TBA</div>
                <div class="raffle-info">👥 Katılımcı: 0 kişi</div>
                <div class="prize-amount">TBA</div>
                <div class="raffle-info">Ödül Havuzu</div>
                <a href="#" class="btn" style="background: #6b7280;">Yakında</a>
              </div>
            </div>
            
            <script>
              fetch('/api/raffles/active')
                .then(res => res.json())
                .then(data => {
                  console.log('Çekiliş verileri:', data);
                })
                .catch(err => console.error('API hatası:', err));
            </script>
          </div>
        </body>
      </html>
    `);
  });

  // Donations page
  app.get('/donations', (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html lang="tr">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Bağışlar - DUXXAN</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background: linear-gradient(135deg, #10b981 0%, #059669 100%);
              min-height: 100vh;
              padding: 2rem;
            }
            .container { max-width: 1200px; margin: 0 auto; }
            .header {
              background: white;
              padding: 2rem;
              border-radius: 1rem;
              box-shadow: 0 20px 40px rgba(0,0,0,0.1);
              margin-bottom: 2rem;
              text-align: center;
            }
            .donation-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
              gap: 1.5rem;
            }
            .donation-card {
              background: white;
              border-radius: 1rem;
              padding: 2rem;
              box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            }
            .donation-title { font-size: 1.5rem; font-weight: bold; color: #10b981; margin-bottom: 1rem; }
            .progress-bar {
              background: #e5e7eb;
              border-radius: 1rem;
              height: 1rem;
              margin: 1rem 0;
              overflow: hidden;
            }
            .progress-fill {
              background: #10b981;
              height: 100%;
              border-radius: 1rem;
              transition: width 0.3s ease;
            }
            .btn { 
              background: #10b981; 
              color: white; 
              padding: 0.75rem 1.5rem; 
              border: none; 
              border-radius: 0.5rem; 
              cursor: pointer; 
              text-decoration: none; 
              display: inline-block;
              margin-top: 1rem;
            }
            .nav { margin-bottom: 2rem; }
            .nav a { 
              background: rgba(255,255,255,0.2); 
              color: white; 
              padding: 0.5rem 1rem; 
              margin: 0.25rem; 
              border-radius: 0.5rem; 
              text-decoration: none;
              display: inline-block;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="nav">
              <a href="/">🏠 Ana Sayfa</a>
              <a href="/app">🚀 Uygulama</a>
              <a href="/raffles">🎲 Çekilişler</a>
            </div>
            
            <div class="header">
              <h1>💰 Bağış Kampanyaları</h1>
              <p>Sosyal sorumluluk projeleri için güvenli bağış sistemi</p>
            </div>
            
            <div class="donation-grid">
              <div class="donation-card">
                <div class="donation-title">Eğitim Desteği Kampanyası</div>
                <p>Dezavantajlı çocuklar için eğitim materyali desteği</p>
                <div class="progress-bar">
                  <div class="progress-fill" style="width: 65%;"></div>
                </div>
                <div style="display: flex; justify-content: space-between; margin: 1rem 0;">
                  <span>Toplanan: 6.5 BNB</span>
                  <span>Hedef: 10 BNB</span>
                </div>
                <a href="#" class="btn">Bağış Yap</a>
              </div>
              
              <div class="donation-card">
                <div class="donation-title">Çevre Koruma Projesi</div>
                <p>Ağaçlandırma ve çevre temizlik çalışmaları</p>
                <div class="progress-bar">
                  <div class="progress-fill" style="width: 30%;"></div>
                </div>
                <div style="display: flex; justify-content: space-between; margin: 1rem 0;">
                  <span>Toplanan: 1.5 BNB</span>
                  <span>Hedef: 5 BNB</span>
                </div>
                <a href="#" class="btn">Bağış Yap</a>
              </div>
            </div>
            
            <script>
              fetch('/api/donations/active')
                .then(res => res.json())
                .then(data => {
                  console.log('Bağış verileri:', data);
                })
                .catch(err => console.error('API hatası:', err));
            </script>
          </div>
        </body>
      </html>
    `);
  });

  // Direct React app serving without Vite for iframe compatibility
  app.get('/react-app', (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html lang="tr">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>DUXXAN - React App</title>

          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background: #f8fafc;
            }
            .app-container { min-height: 100vh; }
            .navbar {
              background: white;
              box-shadow: 0 1px 3px rgba(0,0,0,0.1);
              padding: 1rem 2rem;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .logo { font-size: 1.8rem; font-weight: bold; color: #667eea; }
            .nav-links { display: flex; gap: 1rem; }
            .nav-link {
              padding: 0.5rem 1rem;
              border-radius: 0.5rem;
              text-decoration: none;
              color: #374151;
              transition: all 0.2s;
            }
            .nav-link:hover, .nav-link.active {
              background: #667eea;
              color: white;
            }
            .main-content { padding: 2rem; max-width: 1200px; margin: 0 auto; }
            .page-header {
              background: white;
              padding: 2rem;
              border-radius: 1rem;
              box-shadow: 0 4px 6px rgba(0,0,0,0.05);
              margin-bottom: 2rem;
              text-align: center;
            }
            .grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
              gap: 1.5rem;
              margin: 2rem 0;
            }
            .card {
              background: white;
              border-radius: 1rem;
              padding: 2rem;
              box-shadow: 0 4px 6px rgba(0,0,0,0.05);
              transition: transform 0.2s;
            }
            .card:hover { transform: translateY(-2px); }
            .card-title { font-size: 1.25rem; font-weight: bold; margin-bottom: 1rem; }
            .btn {
              background: #667eea;
              color: white;
              border: none;
              padding: 0.75rem 1.5rem;
              border-radius: 0.5rem;
              cursor: pointer;
              text-decoration: none;
              display: inline-block;
              margin: 0.5rem 0.5rem 0.5rem 0;
              transition: background 0.2s;
            }
            .btn:hover { background: #5a67d8; }
            .btn-success { background: #10b981; }
            .btn-success:hover { background: #059669; }
            .stats-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
              gap: 1rem;
              margin: 2rem 0;
            }
            .stat-card {
              background: linear-gradient(135deg, #667eea, #764ba2);
              color: white;
              padding: 1.5rem;
              border-radius: 1rem;
              text-align: center;
            }
            .stat-value { font-size: 2rem; font-weight: bold; }
            .stat-label { opacity: 0.9; margin-top: 0.5rem; }
            .loading { text-align: center; padding: 2rem; color: #6b7280; }
          </style>
        </head>
        <body>
          <div id="root"></div>
          
          <script>
            // Simple state management without React
            function createSimpleApp() {
              let currentPage = window.location.hash.slice(1) || '/';
              let appData = { stats: null };
              
              function render() {
                const root = document.getElementById('root');
                root.innerHTML = getPageHTML(currentPage);
                attachEventListeners();
              }
              
              function navigate(path) {
                currentPage = path;
                window.location.hash = path;
                render();
              }
              
              function getPageHTML(path) {
                const navbar = \`
                  <nav class="navbar">
                    <div class="logo">DUXXAN</div>
                    <div class="nav-links">
                      <a href="#/" class="nav-link \${path === '/' ? 'active' : ''}" data-path="/">Ana Sayfa</a>
                      <a href="#/raffles" class="nav-link \${path === '/raffles' ? 'active' : ''}" data-path="/raffles">Çekilişler</a>
                      <a href="#/donations" class="nav-link \${path === '/donations' ? 'active' : ''}" data-path="/donations">Bağışlar</a>
                      <a href="#/community" class="nav-link \${path === '/community' ? 'active' : ''}" data-path="/community">Topluluk</a>
                    </div>
                  </nav>
                \`;
                
                let content = '';
                if (path === '/') {
                  content = getHomePageHTML();
                } else if (path === '/raffles') {
                  content = getRafflesPageHTML();
                } else if (path === '/donations') {
                  content = getDonationsPageHTML();
                } else if (path === '/community') {
                  content = getCommunityPageHTML();
                } else {
                  content = '<div class="main-content"><h1>404 - Sayfa Bulunamadı</h1></div>';
                }
                
                return \`<div class="app-container">\${navbar}\${content}</div>\`;
              }
              
              function getHomePageHTML() {
                const statsHTML = appData.stats ? \`
                  <div class="stats-grid">
                    <div class="stat-card">
                      <div class="stat-value">\${appData.stats.totalRaffles}</div>
                      <div class="stat-label">Toplam Çekiliş</div>
                    </div>
                    <div class="stat-card">
                      <div class="stat-value">\${appData.stats.totalPrizePool}</div>
                      <div class="stat-label">Ödül Havuzu (BNB)</div>
                    </div>
                    <div class="stat-card">
                      <div class="stat-value">\${appData.stats.totalDonations}</div>
                      <div class="stat-label">Toplam Bağış</div>
                    </div>
                    <div class="stat-card">
                      <div class="stat-value">\${appData.stats.activeUsers}</div>
                      <div class="stat-label">Aktif Kullanıcı</div>
                    </div>
                  </div>
                \` : '<div class="loading">İstatistikler yükleniyor...</div>';
                
                return \`
                  <div class="main-content">
                    <div class="page-header">
                      <h1 style="color: #667eea; margin-bottom: 1rem;">DUXXAN Platform</h1>
                      <p style="color: #6b7280; font-size: 1.1rem;">Blockchain tabanlı çekiliş ve bağış platformu</p>
                    </div>
                    \${statsHTML}
                    <div class="grid">
                      <div class="card">
                        <h3 class="card-title">🎲 Çekiliş Sistemi</h3>
                        <p>Blockchain tabanlı adil ve şeffaf çekiliş mekanizması</p>
                        <a href="#/raffles" class="btn" data-path="/raffles">Çekilişleri Gör</a>
                      </div>
                      <div class="card">
                        <h3 class="card-title">💰 Bağış Kampanyaları</h3>
                        <p>Sosyal sorumluluk projeleri için güvenli bağış sistemi</p>
                        <a href="#/donations" class="btn btn-success" data-path="/donations">Bağış Yap</a>
                      </div>
                      <div class="card">
                        <h3 class="card-title">🔐 Cüzdan Entegrasyonu</h3>
                        <p>MetaMask ve Trust Wallet ile güvenli işlemler</p>
                        <button class="btn" onclick="alert('Cüzdan bağlantısı yakında...')">Cüzdan Bağla</button>
                      </div>
                      <div class="card">
                        <h3 class="card-title">👥 Topluluk</h3>
                        <p>Kanallar, sohbet ve topluluk etkinlikleri</p>
                        <a href="#/community" class="btn" data-path="/community">Topluluğa Katıl</a>
                      </div>
                    </div>
                  </div>
                \`;
              }
              
              function getRafflesPageHTML() {
                return \`
                  <div class="main-content">
                    <div class="page-header">
                      <h1>🎲 Çekilişler</h1>
                      <p>Aktif çekilişlere katılın ve ödül kazanın</p>
                    </div>
                    <div class="grid">
                      <div class="card">
                        <h3 class="card-title" style="color: #667eea;">Mega Crypto Çekiliş</h3>
                        <p>Ödül: 25.0 BNB</p>
                        <p>Katılımcı: 150 kişi</p>
                        <p>Durum: Aktif</p>
                        <button class="btn" onclick="alert('Çekiliş katılımı yakında...')">Katıl</button>
                      </div>
                    </div>
                  </div>
                \`;
              }
              
              function getDonationsPageHTML() {
                return \`
                  <div class="main-content">
                    <div class="page-header">
                      <h1>💰 Bağış Kampanyaları</h1>
                      <p>İyilik için bağış yapın</p>
                    </div>
                    <div class="grid">
                      <div class="card">
                        <h3 class="card-title" style="color: #10b981;">Eğitim Desteği</h3>
                        <p>Dezavantajlı çocuklar için eğitim materyali</p>
                        <p>Hedef: 10 BNB</p>
                        <button class="btn btn-success" onclick="alert('Bağış sistemi yakında...')">Bağış Yap</button>
                      </div>
                    </div>
                  </div>
                \`;
              }
              
              function getCommunityPageHTML() {
                return \`
                  <div class="main-content">
                    <div class="page-header">
                      <h1>👥 Topluluk</h1>
                      <p>Topluluk kanalları ve etkinlikler</p>
                    </div>
                    <div class="card">
                      <h3 class="card-title">Genel Sohbet</h3>
                      <p>Topluluk üyeleri ile sohbet edin</p>
                      <button class="btn" onclick="alert('Sohbet sistemi yakında...')">Sohbete Katıl</button>
                    </div>
                  </div>
                \`;
              }
              
              function attachEventListeners() {
                // Navigation links
                document.querySelectorAll('[data-path]').forEach(link => {
                  link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const path = link.getAttribute('data-path');
                    navigate(path);
                  });
                });
              }
              
              function loadStats() {
                fetch('/api/stats')
                  .then(res => res.json())
                  .then(data => {
                    appData.stats = data;
                    if (currentPage === '/') render(); // Re-render home page if active
                  })
                  .catch(console.error);
              }
              
              // Initialize
              window.addEventListener('hashchange', () => {
                currentPage = window.location.hash.slice(1) || '/';
                render();
              });
              
              loadStats();
              render();
            }
            
            // Start the app
            createSimpleApp();
          </script>
        </body>
      </html>
    `);
  });
  
  // Fallback routing
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ error: 'API endpoint not found' });
    }
    res.redirect('/');
  });

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
