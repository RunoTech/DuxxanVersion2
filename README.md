# DUXXAN Platform - Microservices Architecture

A comprehensive cryptocurrency-based raffle and donation platform built with modern microservices architecture, featuring enhanced security, performance optimizations, and scalable deployment.

## 🏗️ Architecture Overview

### Microservices Structure
- **Auth Service** (`services/auth/`) - JWT-based authentication with device fingerprinting
- **User Service** (`services/user/`) - User profile and device management
- **Raffle Service** (`services/raffle/`) - Raffle creation and ticket management
- **Donation Service** (`services/donation/`) - Donation campaigns and contributions
- **Notification Service** (`services/notification/`) - Email and push notifications

### Frontend Optimization
- **Component-based architecture** with separated chart components (`client/src/components/charts/`)
- **Custom hooks** for data fetching (`client/src/lib/hooks/`)
- **Skeleton loading states** for improved UX (`client/src/components/skeletons/`)
- **TanStack Query** for caching and state management
- **Zod validation** for form handling and data validation

### Backend Enhancements
- **Queue system** (`lib/queue.ts`) for handling slow operations
- **Security middleware** (`middleware/security.ts`) with rate limiting and input sanitization
- **Monitoring system** (`lib/monitoring.ts`) for performance tracking
- **Comprehensive validation** (`lib/validation/schemas.ts`) for all API endpoints

## 🛡️ Security Features

### Authentication & Authorization
- JWT tokens with device fingerprinting
- Rate limiting (100 requests/15min globally, 5 auth attempts/15min)
- IP-based intrusion detection
- CSRF protection for state-changing operations

### Data Protection
- Input sanitization for XSS prevention
- SQL injection protection through parameterized queries
- Request size limiting (10MB max)
- Security headers (HSTS, CSP, etc.)

### Monitoring & Intrusion Detection
- Real-time suspicious activity tracking
- Automatic IP blocking for violations
- Performance metrics and error tracking
- Health check endpoints

## 🚀 Performance Optimizations

### Caching Strategy
- TanStack Query with intelligent cache invalidation
- Stale-while-revalidate patterns
- Optimistic updates for better UX

### Database Optimization
- Query performance tracking
- Transaction-based operations
- Pagination and infinite scroll
- Optimized joins and indexes

### Bundle Optimization
- Code splitting and lazy loading
- Tree shaking for unused code
- Minification and compression
- Asset optimization

## 📊 Queue System

### Job Types
- **Raffle End Calculation** - Automated winner selection
- **Email Notifications** - Async email sending
- **Blockchain Verification** - Transaction confirmation

### Features
- Priority-based job processing
- Exponential backoff retry logic
- Concurrent job execution (max 5)
- Job status monitoring

## 🔧 Development Setup

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- Redis (optional, for production caching)

### Environment Configuration
```bash
cp .env.example .env
# Configure your environment variables
```

### Installation
```bash
npm install
npm run db:push  # Initialize database
npm run dev      # Start development server
```

### Database Schema
```bash
npm run db:generate  # Generate migrations
npm run db:push      # Apply to database
npm run db:studio    # Open Drizzle Studio
```

## 🐳 Production Deployment

### Docker Deployment
```bash
# Copy environment file
cp .env.example .env.production

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

### Service Architecture
- **Frontend**: Nginx serving React SPA
- **API Gateway**: Load balancer with SSL termination
- **Database**: PostgreSQL with persistent volumes
- **Cache**: Redis for sessions and temporary data
- **Workers**: Background job processing

### Monitoring Endpoints
- `/health` - System health check
- `/metrics` - Performance metrics
- `/api/monitoring/stats` - Detailed statistics

## 📈 Performance Monitoring

### Metrics Tracked
- Request count and response times
- Error rates by endpoint
- Database query performance
- Memory and CPU usage
- Active connection counts

### Alerting
- Slow query detection (>1000ms)
- High error rates (>5% in 15min)
- System resource exhaustion
- Failed authentication attempts

## 🔍 Security Audit

### Automated Checks
```bash
npm run security-audit  # Check dependencies
npm run lint           # Code quality
npm run type-check     # TypeScript validation
```

### Manual Review
- Review security headers configuration
- Validate input sanitization rules
- Check rate limiting effectiveness
- Audit database query patterns

## 📦 Build & Deployment

### Production Build
```bash
npm run build          # Build for production
npm run bundle-analyze # Analyze bundle size
npm start             # Start production server
```

### Environment Variables
Required for production:
- `DATABASE_URL` - PostgreSQL connection
- `JWT_SECRET` - JWT signing key (32+ characters)
- `STRIPE_SECRET_KEY` - Payment processing
- `CORS_ORIGIN` - Allowed frontend domains

## 🧪 Testing

### Test Suite
```bash
npm test              # Run all tests
npm run test:ui       # Interactive test UI
npm run test:coverage # Coverage report
```

### Load Testing
- API endpoint stress testing
- Database connection pooling
- WebSocket concurrent connections
- Memory leak detection

## 🔧 Maintenance

### Regular Tasks
- Database backup and recovery testing
- Security dependency updates
- Performance metric review
- Log rotation and cleanup

### Scaling Considerations
- Horizontal scaling with load balancers
- Database read replicas
- CDN for static assets
- Microservice containerization

## 📝 API Documentation

### Authentication
```
POST /auth/login
POST /auth/validate
POST /auth/logout
```

### Raffles
```
GET    /api/raffles
POST   /api/raffles
GET    /api/raffles/:id
PATCH  /api/raffles/:id
POST   /api/raffles/:id/tickets
```

### Donations
```
GET    /api/donations
POST   /api/donations
GET    /api/donations/:id
POST   /api/donations/:id/contribute
```

### User Management
```
GET    /api/users/me
PATCH  /api/users/me
POST   /api/users/me/devices
GET    /api/users/me/photos
```

## 🤝 Contributing

1. Follow TypeScript strict mode
2. Use Zod for all validation
3. Implement proper error handling
4. Add comprehensive tests
5. Update documentation

## 📄 License

MIT License - see LICENSE file for details