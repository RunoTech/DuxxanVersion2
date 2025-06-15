# Redis ve Firebase Entegrasyonu - DUXXAN Platform

Bu doküman DUXXAN platformunda Redis ve Firebase entegrasyonunun kurulumu ve kullanımını açıklar.

## 🔧 Kurulum

### Redis Kurulumu

**Yerel Geliştirme:**
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install redis-server

# macOS
brew install redis

# Docker ile
docker run -d --name redis -p 6379:6379 redis:alpine
```

**Üretim Ortamı:**
- AWS ElastiCache
- Google Cloud Memorystore
- DigitalOcean Redis

### Firebase Kurulumu

1. [Firebase Console](https://console.firebase.google.com/) üzerinden proje oluşturun
2. "Project Settings" > "Service accounts" bölümüne gidin
3. "Generate new private key" ile JSON dosyasını indirin
4. JSON içeriğini environment variable'lara ekleyin

## 🔑 Environment Variables

`.env` dosyanıza aşağıdaki değişkenleri ekleyin:

```bash
# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password
REDIS_URL=redis://localhost:6379

# Firebase Configuration  
FIREBASE_PROJECT_ID=duxxan-platform
FIREBASE_PRIVATE_KEY_ID=abc123...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@duxxan-platform.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=123456789...
```

## 🚀 Kullanım

### Redis Servisi

```typescript
import { redis } from './lib/redis';

// Cache işlemleri
await redis.set('user:123', userData, 3600); // 1 saat TTL
const user = await redis.get('user:123');

// Session yönetimi
await redis.setSession(sessionId, sessionData);
const session = await redis.getSession(sessionId);

// Rate limiting
const { allowed, remaining } = await redis.checkRateLimit('user:123', 100, 3600);

// Queue işlemleri
await redis.addToQueue('email', emailJob, 5); // priority: 5
const job = await redis.getFromQueue('email');
```

### Firebase Servisi

```typescript
import { firebase } from './lib/firebase';

// Push notification
await firebase.sendNotification(deviceToken, {
  title: 'Çekiliş Kazandınız!',
  body: 'Tebrikler! Bitcoin çekilişini kazandınız.',
}, { raffleId: '123' });

// Firestore işlemleri
await firebase.saveDocument('raffles', raffleId, raffleData);
const raffle = await firebase.getDocument('raffles', raffleId);

// Analytics
await firebase.saveRaffleEvent(raffleId, 'winner_selected', { winnerId });
```

### Queue Sistemi

```typescript
import { addRaffleEndJob, addEmailJob, addBlockchainJob } from './lib/queue-redis';

// Çekiliş bitiş işi
addRaffleEndJob(raffleId, endDate);

// E-posta gönderimi
addEmailJob('user@example.com', 'Kazandınız!', emailBody);

// Blockchain işlem kontrolü
addBlockchainJob(txHash, 'ticket_purchase', userId, amount);
```

## 📊 Monitoring ve Analytics

### Redis Monitoring
```typescript
// Queue durumu
const stats = await jobQueue.getStats();
console.log(stats);

// Redis bağlantı kontrolü
const isHealthy = await redis.ping();
```

### Firebase Analytics
```typescript
// Analitik verileri
const analytics = await firebase.getAnalytics(startDate, endDate);

// Real-time dinleyiciler
const unsubscribe = firebase.listenToCollection('raffles', 
  (raffles) => console.log('Çekilişler güncellendi:', raffles.length)
);
```

## 🔒 Güvenlik

### Redis Güvenlik
- AUTH password kullanın
- Bind IP adreslerini sınırlayın
- SSL/TLS etkinleştirin (üretim)
- CONFIG komutlarını devre dışı bırakın

### Firebase Güvenlik
- Service account key'lerini güvenli saklayın
- Firestore Security Rules yapılandırın
- Minimum gerekli izinleri verin

## 🎯 Özellikler

### Cache Yönetimi
- Aktif çekilişler cache'i (5 dakika)
- Bağış kampanyaları cache'i (5 dakika)
- Kullanıcı session'ları (24 saat)
- Rate limiting (IP bazlı)

### Queue İşlemleri
1. **Çekiliş Sonlandırma**: Otomatik kazanan seçimi
2. **E-posta Bildirimleri**: Kazanan bilgilendirmeleri
3. **Blockchain Kontrolü**: Transaction doğrulama
4. **Push Notification**: Mobil bildirimler

### Real-time Features
- WebSocket bağlantı takibi
- Live çekiliş güncellemeleri
- Anlık bağış bildirimleri
- Chat sistemi desteği

## 🔄 Job Types

### RAFFLE_END_CALCULATION
```typescript
{
  type: 'RAFFLE_END_CALCULATION',
  data: { raffleId: 123 },
  priority: 5,
  maxRetries: 3
}
```

### EMAIL_NOTIFICATION
```typescript
{
  type: 'EMAIL_NOTIFICATION', 
  data: { to: 'user@example.com', subject: '...', body: '...' },
  priority: 3,
  maxRetries: 5
}
```

### BLOCKCHAIN_TRANSACTION
```typescript
{
  type: 'BLOCKCHAIN_TRANSACTION',
  data: { transactionHash: '0x...', type: 'ticket_purchase', userId: 123 },
  priority: 4,
  maxRetries: 3
}
```

### PUSH_NOTIFICATION
```typescript
{
  type: 'PUSH_NOTIFICATION',
  data: { userIds: [1,2,3], title: '...', body: '...', type: 'raffle_winner' },
  priority: 2,
  maxRetries: 2
}
```

## 🐛 Troubleshooting

### Redis Bağlantı Sorunları
```bash
# Redis çalışıyor mu?
redis-cli ping

# Port dinleniyor mu?
netstat -tlnp | grep 6379

# Log kontrolü
tail -f /var/log/redis/redis-server.log
```

### Firebase Sorunları
```typescript
// Bağlantı testi
const isHealthy = await firebase.healthCheck();

// Auth testi
try {
  await firebase.auth.listUsers(1);
  console.log('Firebase auth OK');
} catch (error) {
  console.error('Firebase auth failed:', error);
}
```

### Queue Sorunları
```typescript
// Bekleyen işler
const queueStats = await jobQueue.getStats();

// Başarısız işler
const failedJobs = await redis.get('failed_jobs');

// Processing işleri
const processing = await redis.smembers('processing_jobs');
```

## 📈 Performance Optimizasyonu

### Redis
- Connection pooling kullanın
- Pipeline ile batch işlemler
- Memory policy ayarlayın
- Monitoring setup'ı

### Firebase
- Batch write işlemleri
- Index optimizasyonu
- Offline persistence
- Real-time listener optimizasyonu

## 🚨 Üretim Hazırlığı

### Redis Production Checklist
- [ ] Persistent storage yapılandırması
- [ ] Memory limit ayarları
- [ ] Backup stratejisi
- [ ] Monitoring (CloudWatch, DataDog)
- [ ] SSL/TLS
- [ ] Firewall kuralları

### Firebase Production Checklist
- [ ] Security Rules
- [ ] Budget alerts
- [ ] Performance monitoring
- [ ] Backup stratejisi
- [ ] User management
- [ ] Analytics setup

Bu entegrasyon DUXXAN platformunun ölçeklenebilir, güvenilir ve performanslı çalışmasını sağlar.