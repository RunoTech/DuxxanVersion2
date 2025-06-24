# DUXXAN Platform - Blockchain-Based Raffle and Donation System

## Overview

DUXXAN is a comprehensive blockchain-based platform that enables users to create and participate in raffles and donation campaigns using USDT on the Binance Smart Chain (BSC). The platform combines modern web technologies with smart contract integration to provide a secure, transparent, and user-friendly experience for charity fundraising and prize-based competitions.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with Vite for fast development and optimized builds
- **UI Library**: Radix UI components with shadcn/ui for consistent design system
- **Styling**: Tailwind CSS with custom animations and responsive design
- **State Management**: TanStack Query for server state and caching
- **Form Handling**: React Hook Form with Zod validation schemas
- **Charts**: Chart.js for analytics and data visualization
- **Routing**: React Router for client-side navigation

### Backend Architecture
- **Runtime**: Node.js with TypeScript and ESM modules
- **Framework**: Express.js with comprehensive middleware stack
- **Database ORM**: Drizzle ORM with PostgreSQL
- **API Design**: RESTful endpoints with validation middleware
- **Security**: Multi-layered security with rate limiting, CSRF protection, and input sanitization
- **Real-time**: WebSocket integration for live updates

### Blockchain Integration
- **Network**: Binance Smart Chain (BSC) mainnet
- **Smart Contract**: Custom Solidity contract with OpenZeppelin security patterns
- **Token**: USDT (0x55d398326f99059fF775485246999027B3197955)
- **Wallet Integration**: Web3 wallet connection with MetaMask support
- **Gas Optimization**: Efficient contract design with minimal transaction costs

## Key Components

### Smart Contract Features
- **Raffle System**: USDT-based ticket sales with automated winner selection using 6-layer entropy
- **Donation System**: Campaign creation with real-time progress tracking
- **Commission Structure**: 10% raffle commission (5% platform, 5% creator), 2% donation commission
- **Multi-signature Approval**: Creator and winner approval system for prize distribution
- **Physical Prize Support**: Real-world prize claiming with fallback mechanisms
- **Security**: ReentrancyGuard, pausable controls, and comprehensive input validation

### Database Schema
- **Users**: Wallet-based authentication with comprehensive profile management
- **Raffles**: Complete raffle lifecycle with ticket tracking and winner selection
- **Donations**: Campaign management with contribution tracking and goal monitoring
- **Transactions**: Blockchain transaction logging and verification
- **Categories**: Organized content classification for better discovery
- **Mail System**: Internal messaging system for user communication

### Security Implementation
- **DDoS Protection**: Progressive rate limiting with automatic IP blocking
- **Input Validation**: Comprehensive sanitization with XSS prevention
- **Authentication**: JWT-based auth with device fingerprinting
- **Database Security**: Parameterized queries and constraint validation
- **Smart Contract Security**: Reentrancy protection and access controls

## Data Flow

### Raffle Creation Flow
1. User connects wallet and creates raffle with metadata
2. Smart contract validates parameters and charges creation fee (25 USDT)
3. Backend stores raffle data with blockchain transaction reference
4. Real-time updates notify subscribers of new raffle availability

### Ticket Purchase Flow
1. User selects raffle and specifies ticket quantity
2. Frontend calculates total cost including commission
3. Smart contract processes payment and distributes commission automatically
4. Backend updates ticket counts and participant tracking

### Winner Selection Flow
1. Raffle ends automatically or manually by admin
2. Smart contract uses 6-layer entropy system for fair winner selection
3. Multi-signature approval process begins between creator and winner
4. Prize distribution occurs after both parties approve transaction

### Donation Flow
1. Creator establishes campaign with target amount and timeline
2. Contributors make donations with optional anonymity
3. Smart contract charges 2% commission from donors (not creators)
4. Real-time progress tracking updates campaign status

## External Dependencies

### Infrastructure Services
- **Database**: PostgreSQL with connection pooling and failover
- **Caching**: Redis for session management and performance optimization
- **File Storage**: Local storage with planned cloud migration
- **Email**: SMTP integration for notifications and communications

### Blockchain Services
- **BSC RPC**: Primary and fallback RPC endpoints for reliability
- **BSCScan API**: Transaction verification and contract interaction
- **Wallet Providers**: MetaMask and WalletConnect integration

### Third-party Integrations
- **Google Translate API**: Multi-language support for global accessibility
- **Stripe**: Payment processing for non-crypto users (optional)
- **Firebase**: Real-time notifications and analytics (optional)

## Deployment Strategy

### Development Environment
- **Local Setup**: Full stack running on localhost with hot reload
- **Database**: Local PostgreSQL with migration support
- **Blockchain**: BSC testnet for safe development and testing
- **Build System**: Vite for frontend, TSX for backend compilation

### Production Deployment
- **Platform**: Replit with auto-scaling capabilities
- **Build Process**: Automated build pipeline with optimization
- **Database**: Neon PostgreSQL with connection pooling
- **CDN**: Static asset optimization and delivery
- **Monitoring**: Health checks and performance metrics
- **SSL**: Automatic HTTPS with security headers

### Container Support
- **Docker**: Multi-service container setup with docker-compose
- **Services**: Separated containers for database, Redis, and application
- **Networking**: Internal network communication with external port mapping
- **Volumes**: Persistent data storage for database and uploaded files

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

- June 24, 2025: Created comprehensive historical data with 110+ realistic raffles and 70+ donation campaigns
  - All content spans 8 months of historical data (August 2024 - November 2024)
  - Realistic pricing and participation rates for international audience
  - Country restrictions exclude Turkey and restricted nations (TR, IR, SY, AF, KP)
  - Varied categories: luxury cars, premium real estate, electronics, jewelry, land investments
  - Donation campaigns cover emergency aid, infrastructure, education, and healthcare
  - All campaigns appear authentic with realistic funding progress and participant counts

## Changelog

- June 24, 2025: Populated platform with 180+ realistic historical entries for established platform appearance
- June 23, 2025: Initial setup and admin panel development