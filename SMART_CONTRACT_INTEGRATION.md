# DUXXAN Smart Contract Integration Guide

## Overview

The DUXXAN platform uses a custom smart contract deployed on Binance Smart Chain (BSC) to handle raffles and donations with USDT payments. The contract implements the specified commission structure and organizational features.

## Contract Features

### Commission Structure
- **Raffle Creation Fee**: 25 USDT (goes to commission wallet)
- **Donation Creation Fee**: 25 USDT (goes to commission wallet)
- **Raffle Ticket Commission**: 10% total
  - 5% to platform commission wallet
  - 5% to raffle creator
- **Donation Commission**: 2% (goes to commission wallet)

### Organization Types
1. **Individual**: Time-limited donations only
2. **Foundation**: Unlimited duration donations
3. **Association**: Unlimited duration donations
4. **Official**: Unlimited duration donations

### Key Functions

#### Raffle Functions
- `createRaffle()`: Create a new raffle with prize amount and ticket parameters
- `buyTickets()`: Purchase raffle tickets with automatic commission distribution
- `endRaffle()`: End raffle and select winner using pseudo-random selection

#### Donation Functions
- `createDonation()`: Create donation campaigns with organization type
- `donate()`: Make donations with automatic commission deduction

## Deployment Instructions

### Prerequisites
1. MetaMask wallet with BNB for gas fees
2. USDT balance for testing
3. BSCScan API key (for contract verification)

### Environment Setup

Create `.env` file with:
```
PRIVATE_KEY=your_wallet_private_key
COMMISSION_WALLET=your_commission_wallet_address
BSCSCAN_API_KEY=your_bscscan_api_key
VITE_CONTRACT_ADDRESS=deployed_contract_address
```

### Deployment Steps

1. **Install Dependencies**
   ```bash
   cd contracts
   npm install
   ```

2. **Compile Contracts**
   ```bash
   npx hardhat compile
   ```

3. **Deploy to BSC Testnet** (Recommended first)
   ```bash
   npx hardhat run scripts/deploy.js --network bscTestnet
   ```

4. **Deploy to BSC Mainnet**
   ```bash
   npx hardhat run scripts/deploy.js --network bsc
   ```

5. **Verify Contract**
   ```bash
   npx hardhat verify --network bsc CONTRACT_ADDRESS "USDT_ADDRESS" "COMMISSION_WALLET"
   ```

### Quick Deployment
Run the automated deployment script:
```bash
./deploy-contract.sh
```

## Frontend Integration

### Contract Service Usage

```typescript
import { contractService } from '@/lib/contractService';

// Initialize contract connection
await contractService.initialize();

// Create a raffle
const result = await contractService.createRaffle(
  "My Raffle",
  "Description",
  "100", // Prize amount in USDT
  "5",   // Ticket price in USDT
  50,    // Max tickets
  7      // Duration in days
);

// Buy tickets
await contractService.buyTickets(raffleId, quantity);

// Create donation
await contractService.createDonation(
  "Help Campaign",
  "Description",
  "1000", // Goal amount
  30,     // Duration in days (0 for unlimited)
  0       // Organization type (0=Individual)
);

// Make donation
await contractService.donate(donationId, "50");
```

### Network Configuration

The contract automatically handles BSC network switching and includes:
- BSC Mainnet: Chain ID 56
- USDT Contract: 0x55d398326f99059fF775485246999027B3197955

## Security Features

- **ReentrancyGuard**: Prevents reentrancy attacks
- **Pausable**: Emergency pause functionality
- **Ownable**: Admin controls for platform management
- **USDT Integration**: Direct USDT token transfers

## Gas Optimization

The contract is optimized for gas efficiency:
- Batch operations where possible
- Efficient storage patterns
- Minimal external calls

## Testing

Before mainnet deployment:
1. Deploy to BSC testnet
2. Test all raffle operations
3. Test all donation operations
4. Verify commission distributions
5. Test edge cases and error conditions

## Monitoring

Track contract events:
- `RaffleCreated`
- `TicketPurchased`
- `RaffleEnded`
- `DonationCreated`
- `DonationMade`
- `CommissionPaid`

## Support

For deployment issues:
1. Check BSC network connection
2. Verify USDT allowances
3. Ensure sufficient BNB for gas
4. Check contract address configuration

## Contract Addresses

**BSC Mainnet USDT**: `0x55d398326f99059fF775485246999027B3197955`

**DUXXAN Contract**: Will be provided after deployment

## Commission Wallet Management

The commission wallet receives:
- All creation fees (25 USDT each)
- Platform share of raffle commissions (5%)
- All donation commissions (2%)

Commission wallet can be updated by contract owner for administrative purposes.