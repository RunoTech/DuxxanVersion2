# DUXXAN Platform - Kapsamlı Sistem Dokümantasyonu

## 📋 İçindekiler
1. [Proje Genel Bakış](#proje-genel-bakış)
2. [Sistem Mimarisi](#sistem-mimarisi)
3. [Teknoloji Stack](#teknoloji-stack)
4. [Veritabanı Şeması](#veritabanı-şeması)
5. [API Dokümantasyonu](#api-dokümantasyonu)
6. [Frontend Yapısı](#frontend-yapısı)
7. [Güvenlik Sistemi](#güvenlik-sistemi)
8. [Blockchain Entegrasyonu](#blockchain-entegrasyonu)
9. [Kurulum ve Dağıtım](#kurulum-ve-dağıtım)
10. [Performans ve Monitoring](#performans-ve-monitoring)
11. [Test ve Kalite Kontrol](#test-ve-kalite-kontrol)

---

## 🎯 Proje Genel Bakış

### Platform Amacı
DUXXAN, blockchain tabanlı çekiliş ve bağış platformudur. Kullanıcılar:
- **Çekilişler** oluşturabilir ve katılabilir
- **Bağış kampanyaları** düzenleyebilir ve destekleyebilir
- **Güvenli cüzdan** bağlantısı ile işlem yapabilir
- **Gerçek zamanlı** güncellemeler alabilir
- **Çok dilli** desteğe erişebilir

### Temel Özellikler
- 🎲 **Çekiliş Sistemi**: USDT tabanlı bilet satışı ve otomatik kazanan seçimi
- 💰 **Bağış Sistemi**: Hedef odaklı kampanyalar ve gerçek zamanlı takip
- 🔗 **Blockchain Entegrasyonu**: BSC ağında smart contract desteği
- 👤 **Kullanıcı Profilleri**: Detaylı profil yönetimi ve rating sistemi
- 📧 **İç Mail Sistemi**: Platform içi güvenli mesajlaşma
- 🌍 **Çok Dilli Destek**: Google Translate API entegrasyonu
- 🔐 **Güvenlik**: Çok katmanlı güvenlik sistemi

---

## 🏗️ Sistem Mimarisi

### Genel Mimari
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (React/Vite)  │────│   (Express.js)  │────│   (PostgreSQL)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Wallet        │    │   Blockchain    │    │   External      │
│   (MetaMask)    │    │   (BSC/Ethereum)│    │   Services      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Mikroservis Yaklaşımı
- **Auth Service**: JWT tabanlı kimlik doğrulama
- **User Service**: Kullanıcı profil yönetimi
- **Raffle Service**: Çekiliş operasyonları
- **Donation Service**: Bağış kampanya yönetimi
- **Notification Service**: Bildirim sistemi
- **Mail Service**: İç mesajlaşma sistemi

---

## 💻 Teknoloji Stack

### Frontend
```json
{
  "framework": "React 18.3.1",
  "bundler": "Vite 5.4.14",
  "router": "Wouter 3.3.5",
  "state": "TanStack Query 5.60.5",
  "styling": "Tailwind CSS 3.4.17",
  "ui": "Radix UI + Shadcn/ui",
  "forms": "React Hook Form 7.55.0",
  "validation": "Zod 3.24.2",
  "blockchain": "Ethers.js 6.14.4",
  "charts": "Chart.js 4.5.0"
}
```

### Backend
```json
{
  "runtime": "Node.js + TypeScript",
  "framework": "Express.js 4.21.2",
  "database": "PostgreSQL + Drizzle ORM 0.39.1",
  "cache": "Redis 5.5.6",
  "auth": "JWT + Passport.js",
  "security": "Helmet + Express Rate Limit",
  "monitoring": "Custom monitoring system",
  "websockets": "ws 8.18.0",
  "validation": "Zod + Express Validator"
}
```

### External Services
```json
{
  "blockchain": "Binance Smart Chain (BSC)",
  "translation": "Google Cloud Translate API",
  "notifications": "Firebase Admin SDK",
  "storage": "Base64 image storage",
  "deployment": "Replit + PM2"
}
```

---

## 🗄️ Veritabanı Şeması

### Ana Tablolar

#### Users (Kullanıcılar)
```sql
users {
  id: serial PRIMARY KEY
  wallet_address: varchar(42) UNIQUE NOT NULL
  username: varchar(50) UNIQUE NOT NULL
  name: varchar(100)
  profession: varchar(100)
  bio: text
  profile_image: text
  email: varchar(255)
  phone_number: varchar(20)
  organization_type: varchar(20) DEFAULT 'individual'
  is_verified: boolean DEFAULT false
  rating: decimal(2,1) DEFAULT 5.0
  created_at: timestamp DEFAULT NOW()
}
```

#### Raffles (Çekilişler)
```sql
raffles {
  id: serial PRIMARY KEY
  creator_id: integer REFERENCES users(id)
  category_id: integer REFERENCES categories(id)
  title: varchar(200) NOT NULL
  description: text NOT NULL
  prize_value: decimal(15,6) NOT NULL
  ticket_price: decimal(15,6) NOT NULL
  max_tickets: integer NOT NULL
  tickets_sold: integer DEFAULT 0
  end_date: timestamp NOT NULL
  winner_id: integer REFERENCES users(id)
  is_approved_by_creator: boolean DEFAULT false
  is_approved_by_winner: boolean DEFAULT false
  approval_deadline: timestamp
  transaction_hash: varchar(66)
  created_at: timestamp DEFAULT NOW()
}
```

#### Donations (Bağışlar)
```sql
donations {
  id: serial PRIMARY KEY
  creator_id: integer REFERENCES users(id)
  title: varchar(200) NOT NULL
  description: text NOT NULL
  goal_amount: decimal(15,6) NOT NULL
  current_amount: decimal(15,6) DEFAULT 0
  donor_count: integer DEFAULT 0
  end_date: timestamp
  is_unlimited: boolean DEFAULT false
  commission_rate: decimal(5,2) DEFAULT 10.00
  category: varchar(50) DEFAULT 'general'
  country: varchar(3)
  created_at: timestamp DEFAULT NOW()
}
```

### Güvenlik Tabloları

#### User Devices (Cihaz Takibi)
```sql
user_devices {
  id: serial PRIMARY KEY
  user_id: integer REFERENCES users(id)
  device_fingerprint: varchar(64) NOT NULL
  device_type: varchar(20)
  browser: varchar(50)
  ip_address: varchar(45)
  security_score: integer DEFAULT 50
  is_trusted: boolean DEFAULT false
  last_login_at: timestamp DEFAULT NOW()
}
```

#### Mail Messages (İç Mail)
```sql
mail_messages {
  id: serial PRIMARY KEY
  from_wallet_address: varchar(42) NOT NULL
  to_wallet_address: varchar(42) NOT NULL
  subject: varchar(200) NOT NULL
  content: text NOT NULL
  category: varchar(20) NOT NULL
  is_read: boolean DEFAULT false
  is_starred: boolean DEFAULT false
  created_at: timestamp DEFAULT NOW()
}
```

---

## 🔌 API Dokümantasyonu

### Authentication Endpoints

#### POST /api/auth/wallet-login
Cüzdan ile giriş yapma
```json
{
  "walletAddress": "0x742d35Cc6644C83532345804532345",
  "chainId": 56
}
```

#### POST /api/auth/logout
Çıkış yapma
```json
{
  "message": "Logged out successfully"
}
```

### Raffle Endpoints

#### GET /api/raffles
Aktif çekilişleri listele
```json
{
  "data": [
    {
      "id": 1,
      "title": "iPhone 15 Pro Max Çekilişi",
      "prizeValue": "45000",
      "ticketPrice": "30",
      "maxTickets": 1500,
      "ticketsSold": 892,
      "endDate": "2024-12-31T23:59:59Z"
    }
  ]
}
```

#### POST /api/raffles
Yeni çekiliş oluştur
```json
{
  "title": "Çekiliş Başlığı",
  "description": "Açıklama",
  "prizeValue": "10000",
  "ticketPrice": "50",
  "maxTickets": 200,
  "endDate": "2024-12-31T23:59:59Z",
  "categoryId": 1
}
```

#### POST /api/raffles/:id/purchase-ticket
Bilet satın al
```json
{
  "quantity": 5,
  "transactionHash": "0x..."
}
```

### Donation Endpoints

#### GET /api/donations
Aktif bağışları listele
```json
{
  "data": [
    {
      "id": 1,
      "title": "Deprem Mağdurları İçin Yardım",
      "goalAmount": "100000",
      "currentAmount": "67500",
      "donorCount": 234
    }
  ]
}
```

#### POST /api/donations/:id/contribute
Bağış yap
```json
{
  "amount": "500",
  "transactionHash": "0x..."
}
```

### Mail Endpoints

#### GET /api/mail/inbox
Gelen kutusu
```json
{
  "data": [
    {
      "id": 1,
      "fromAddress": "0x1234...5678",
      "subject": "Çekiliş Kazancınız Onaylandı",
      "isRead": false,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### POST /api/mail/send
Mesaj gönder
```json
{
  "toAddress": "0x9876...4321",
  "subject": "Mesaj Konusu",
  "content": "Mesaj içeriği",
  "category": "user"
}
```

---

## 🎨 Frontend Yapısı

### Dizin Yapısı
```
client/
├── src/
│   ├── components/          # Yeniden kullanılabilir bileşenler
│   │   ├── ui/             # Shadcn/ui bileşenleri
│   │   ├── charts/         # Grafik bileşenleri
│   │   └── forms/          # Form bileşenleri
│   ├── pages/              # Sayfa bileşenleri
│   │   ├── Home.tsx
│   │   ├── Raffles.tsx
│   │   ├── Donations.tsx
│   │   ├── ProfileNew.tsx
│   │   └── Mail.tsx
│   ├── hooks/              # Custom hook'lar
│   │   ├── useWalletFixed.ts
│   │   └── useTranslation.ts
│   ├── lib/                # Yardımcı kütüphaneler
│   │   ├── queryClient.ts
│   │   └── utils.ts
│   └── styles/
│       └── globals.css
```

### Ana Bileşenler

#### Navigation Component
```tsx
export const Navigation = () => {
  const { isConnected, address } = useWallet();
  
  return (
    <nav className="flex items-center justify-between">
      <Logo />
      <NavItems />
      <UserActions address={address} />
    </nav>
  );
};
```

#### RaffleCard Component
```tsx
export const RaffleCard = ({ raffle }: { raffle: Raffle }) => {
  const progress = (raffle.ticketsSold / raffle.maxTickets) * 100;
  
  return (
    <Card className="duxxan-card">
      <CardContent>
        <h3>{raffle.title}</h3>
        <Progress value={progress} />
        <Button>Katıl</Button>
      </CardContent>
    </Card>
  );
};
```

### State Management
React Query ile global state yönetimi:
```tsx
// Query Client yapılandırması
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 dakika
      refetchOnWindowFocus: false,
      retry: false
    }
  }
});

// Örnek query kullanımı
const { data: raffles, isLoading } = useQuery({
  queryKey: ['/api/raffles'],
  enabled: false // Manuel fetch
});
```

---

## 🔐 Güvenlik Sistemi

### Çok Katmanlı Güvenlik

#### 1. Rate Limiting
```javascript
// API rate limiting
const globalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 100, // istek limiti
  message: 'Too many requests'
});

const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // Authentication için daha sıkı limit
  skipSuccessfulRequests: true
});
```

#### 2. Input Validation
```javascript
// Zod şemaları ile validasyon
const walletValidation = z.object({
  walletAddress: z.string()
    .regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid wallet address'),
  chainId: z.number().optional()
});

const amountValidation = z.object({
  amount: z.string()
    .regex(/^\d+(\.\d{1,6})?$/, 'Invalid amount format')
});
```

#### 3. CSRF Protection
```javascript
const csrfProtection = {
  generateToken: (sessionId: string) => {
    return crypto.createHash('sha256')
      .update(sessionId + process.env.CSRF_SECRET)
      .digest('hex');
  },
  
  validateToken: (token: string, sessionId: string) => {
    const expectedToken = csrfProtection.generateToken(sessionId);
    return crypto.timingSafeEqual(
      Buffer.from(token, 'hex'),
      Buffer.from(expectedToken, 'hex')
    );
  }
};
```

#### 4. Device Fingerprinting
```javascript
const generateDeviceFingerprint = (req: Request, deviceInfo: any) => {
  const components = [
    req.get('User-Agent'),
    req.get('Accept-Language'),
    req.get('Accept-Encoding'),
    deviceInfo?.screenResolution,
    deviceInfo?.timezone,
    deviceInfo?.colorDepth
  ].filter(Boolean);
  
  return crypto.createHash('sha256')
    .update(components.join('|'))
    .digest('hex');
};
```

### Güvenlik Monitoring
```javascript
const securityMonitoring = {
  logSuspiciousActivity: (req: Request, type: string) => {
    console.warn(`Suspicious activity: ${type}`, {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    });
  },
  
  blockMaliciousIP: (ip: string) => {
    blockedIPs.add(ip);
    setTimeout(() => blockedIPs.delete(ip), 24 * 60 * 60 * 1000);
  }
};
```

---

## ⛓️ Blockchain Entegrasyonu

### Smart Contract Yapısı
```solidity
// BSC üzerinde raffle contract
contract RaffleContract {
    struct Raffle {
        uint256 id;
        address creator;
        uint256 ticketPrice;
        uint256 maxTickets;
        uint256 soldTickets;
        uint256 endTime;
        address winner;
        bool isApprovedByCreator;
        bool isApprovedByWinner;
    }
    
    mapping(uint256 => Raffle) public raffles;
    mapping(uint256 => mapping(address => uint256)) public tickets;
    
    function createRaffle(...) external;
    function buyTicket(uint256 raffleId, uint256 quantity) external;
    function selectWinner(uint256 raffleId) external;
    function approveByCreator(uint256 raffleId) external;
    function approveByWinner(uint256 raffleId) external;
}
```

### Web3 Frontend Entegrasyonu
```typescript
// Ethers.js kullanarak blockchain bağlantısı
export const useWalletFixed = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string>('');
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  
  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send('eth_requestAccounts', []);
        
        setAddress(accounts[0]);
        setIsConnected(true);
        setProvider(provider);
        
        // Switch to BSC network
        await switchToBSC(provider);
      } catch (error) {
        console.error('Wallet connection failed:', error);
      }
    }
  };
  
  return { isConnected, address, provider, connectWallet };
};
```

### Transaction Handling
```typescript
const purchaseTicket = async (raffleId: number, quantity: number) => {
  if (!provider) throw new Error('Wallet not connected');
  
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(
    CONTRACT_ADDRESS,
    CONTRACT_ABI,
    signer
  );
  
  const ticketPrice = await contract.getRaffleTicketPrice(raffleId);
  const totalAmount = ticketPrice * BigInt(quantity);
  
  const tx = await contract.buyTicket(raffleId, quantity, {
    value: totalAmount
  });
  
  await tx.wait();
  return tx.hash;
};
```

---

## 🚀 Kurulum ve Dağıtım

### Geliştirme Ortamı Kurulumu

#### 1. Repository Clone
```bash
git clone https://github.com/duxxan/platform.git
cd platform
```

#### 2. Dependencies Kurulumu
```bash
npm install
```

#### 3. Environment Variables
```bash
# .env dosyası oluştur
DATABASE_URL=postgresql://user:pass@localhost:5432/duxxan
JWT_SECRET=your-32-character-secret-key
GOOGLE_TRANSLATE_API_KEY=your-google-api-key
FIREBASE_PRIVATE_KEY=your-firebase-private-key
REDIS_URL=redis://localhost:6379
```

#### 4. Veritabanı Kurulumu
```bash
# PostgreSQL database oluştur
npm run db:push
```

#### 5. Geliştirme Sunucusu
```bash
npm run dev
```

### Production Deployment

#### PM2 ile Production
```bash
# Build işlemi
npm run build

# PM2 ile başlat
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

#### Docker Deployment
```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 5000
CMD ["npm", "start"]
```

#### Environment Specific Configs
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'duxxan-api',
    script: 'tsx',
    args: 'server/index.ts',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log'
  }]
};
```

---

## 📊 Performans ve Monitoring

### Performance Metrics
```javascript
class MonitoringService {
  logRequest(req: Request, res: Response, responseTime: number) {
    const metric = {
      timestamp: Date.now(),
      method: req.method,
      url: req.path,
      statusCode: res.statusCode,
      responseTime,
      userAgent: req.get('User-Agent'),
      ip: req.ip
    };
    
    this.metrics.push(metric);
  }
  
  getMetrics() {
    const recentMetrics = this.getRecentMetrics();
    return {
      requestCount: recentMetrics.length,
      errorCount: recentMetrics.filter(m => m.statusCode >= 400).length,
      averageResponseTime: this.calculateAverage(recentMetrics.map(m => m.responseTime)),
      slowQueries: recentMetrics.filter(m => m.responseTime > 1000).length
    };
  }
}
```

### Database Performance
```javascript
// Connection pooling optimization
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
});

// Query performance tracking
const queryPerformanceTracker = {
  slowQueries: [],
  
  trackQuery: (query: string, duration: number) => {
    if (duration > 1000) { // 1 saniyeden yavaş sorgular
      this.slowQueries.push({
        query: query.substring(0, 100),
        duration,
        timestamp: new Date()
      });
    }
  }
};
```

### Memory Management
```javascript
// Memory monitoring ve garbage collection
export const startMemoryMonitoring = () => {
  setInterval(() => {
    const memUsage = process.memoryUsage();
    const heapUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
    
    if (heapUsedMB > 200 && global.gc) {
      global.gc();
      console.log(`GC triggered at ${heapUsedMB}MB heap usage`);
    }
  }, 5 * 60 * 1000); // 5 dakikada bir kontrol
};
```

### Health Check Endpoints
```javascript
app.get('/health', (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    database: 'connected',
    redis: redis.isConnected ? 'connected' : 'disconnected'
  };
  
  res.json(health);
});

app.get('/metrics', (req, res) => {
  const metrics = monitoring.getMetrics();
  res.json(metrics);
});
```

---

## 🧪 Test ve Kalite Kontrol

### Test Stratejisi

#### 1. Unit Tests
```javascript
// User service tests
describe('UserService', () => {
  test('should create user with valid wallet', async () => {
    const userData = {
      walletAddress: '0x742d35Cc6644C83532345804532345',
      username: 'testuser'
    };
    
    const user = await storage.createUser(userData);
    expect(user.walletAddress).toBe(userData.walletAddress);
  });
  
  test('should reject invalid wallet address', async () => {
    const userData = {
      walletAddress: 'invalid-address',
      username: 'testuser'
    };
    
    await expect(storage.createUser(userData)).rejects.toThrow();
  });
});
```

#### 2. Integration Tests
```javascript
// API endpoint tests
describe('Raffle API', () => {
  test('POST /api/raffles should create raffle', async () => {
    const response = await request(app)
      .post('/api/raffles')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Test Raffle',
        prizeValue: '1000',
        ticketPrice: '10',
        maxTickets: 100,
        endDate: new Date(Date.now() + 86400000).toISOString()
      });
      
    expect(response.status).toBe(201);
    expect(response.body.data.title).toBe('Test Raffle');
  });
});
```

#### 3. Security Tests
```javascript
// Security validation tests
describe('Security Middleware', () => {
  test('should block SQL injection attempts', async () => {
    const maliciousInput = "'; DROP TABLE users; --";
    
    const response = await request(app)
      .post('/api/raffles')
      .send({ title: maliciousInput });
      
    expect(response.status).toBe(400);
  });
  
  test('should enforce rate limiting', async () => {
    const requests = Array(10).fill().map(() => 
      request(app).get('/api/raffles')
    );
    
    const responses = await Promise.all(requests);
    const rateLimitedResponses = responses.filter(r => r.status === 429);
    expect(rateLimitedResponses.length).toBeGreaterThan(0);
  });
});
```

### Code Quality Standards

#### ESLint Configuration
```json
{
  "extends": [
    "@typescript-eslint/recommended",
    "prettier"
  ],
  "rules": {
    "no-console": "warn",
    "@typescript-eslint/no-unused-vars": "error",
    "prefer-const": "error",
    "no-var": "error"
  }
}
```

#### Pre-commit Hooks
```json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "pre-push": "npm test"
    }
  },
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{js,jsx}": ["eslint --fix", "prettier --write"]
  }
}
```

---

## 📈 Gelecek Geliştirmeler

### Planlanan Özellikler

#### 1. NFT Entegrasyonu
```javascript
// NFT raffle system
const createNFTRaffle = async (nftTokenId: string, contractAddress: string) => {
  const raffle = await storage.createRaffle({
    type: 'nft',
    nftTokenId,
    nftContractAddress: contractAddress,
    // ... diğer özellikler
  });
  
  return raffle;
};
```

#### 2. Mobile App
- React Native ile iOS/Android app
- Push notification desteği
- Offline çalışma kabiliyeti

#### 3. Advanced Analytics
```javascript
// Analytics dashboard
const getAnalytics = async (startDate: Date, endDate: Date) => {
  const data = await db.query(`
    SELECT 
      DATE(created_at) as date,
      COUNT(*) as total_raffles,
      SUM(prize_value) as total_prize_value,
      AVG(tickets_sold::float / max_tickets) as avg_completion_rate
    FROM raffles 
    WHERE created_at BETWEEN $1 AND $2
    GROUP BY DATE(created_at)
    ORDER BY date
  `, [startDate, endDate]);
  
  return data.rows;
};
```

#### 4. AI-Powered Features
- Otomatik fraud detection
- Smart recommendation system
- Predictive analytics

---

## 📞 Destek ve İletişim

### Geliştirici Dokümantasyonu
- **API Referansı**: `/docs/api`
- **Component Library**: `/docs/components`
- **Database Schema**: `/docs/database`

### Hata Raporlama
1. GitHub Issues üzerinden bug report
2. Security vulnerabilities için özel email
3. Performance issues için monitoring dashboard

### Katkıda Bulunma
1. Fork repository
2. Feature branch oluştur
3. Tests yaz
4. Pull request gönder

---

**Not**: Bu dokümantasyon, DUXXAN platformunun mevcut durumunu yansıtmaktadır. Sistem sürekli geliştirilmekte olup, güncellemeler düzenli olarak yapılmaktadır.

**Son Güncelleme**: Aralık 2024
**Versiyon**: 1.0.0
**Geliştirici**: DUXXAN Development Team