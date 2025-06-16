# DUXXAN BSC Smart Contract Implementation

## Contract Overview

The DUXXAN platform now includes a comprehensive smart contract system deployed on Binance Smart Chain (BSC) with USDT integration. The contract implements your exact specifications without Chainlink dependency.

## Commission Structure Implementation

### Raffle System
- **Creation Fee**: 25 USDT → Commission Wallet
- **Ticket Commission**: 10% of ticket sales
  - 5% → Platform Commission Wallet
  - 5% → Raffle Creator
- **Prize Distribution**: Winner receives full prize amount
- **Auto-end**: Raffles end when all tickets sold or time expires

### Donation System
- **Creation Fee**: 25 USDT → Commission Wallet
- **Donation Commission**: 2% → Commission Wallet
- **Net Amount**: 98% → Donation Creator

### Organization Types
1. **Individual** (Type 0): Time-limited donations only
2. **Foundation** (Type 1): Unlimited duration
3. **Association** (Type 2): Unlimited duration  
4. **Official** (Type 3): Unlimited duration

## Smart Contract Features

### Security
- ReentrancyGuard protection
- Pausable emergency controls
- Owner-only administrative functions
- USDT token validation

### Randomness
- Pseudo-random winner selection using block data
- Ticket-weighted probability distribution
- Transparent selection process

### Gas Optimization
- Efficient storage patterns
- Batch operations where possible
- Minimal external calls

## Deployment Files Created

1. **DuxxanPlatform.sol** - Main contract with all functionality
2. **hardhat.config.js** - BSC network configuration
3. **deploy.js** - Automated deployment script
4. **contractService.ts** - Frontend integration service
5. **contractABI.ts** - Contract interface for frontend
6. **deploy-contract.sh** - One-click deployment script

## Integration Components

### Frontend Service
- MetaMask wallet connection
- Automatic BSC network switching
- USDT approval handling
- Transaction management
- Event listening

### Backend Compatibility
- Works with existing mock payment system
- Database schema compatible
- API endpoints unchanged
- Gradual migration possible

## Deployment Process

### Prerequisites
- MetaMask with BNB for gas
- USDT for testing
- BSCScan API key for verification

### Quick Deployment
```bash
export PRIVATE_KEY=your_private_key
export COMMISSION_WALLET=your_commission_address
./deploy-contract.sh
```

### Manual Deployment
```bash
cd contracts
npm install
npx hardhat compile
npx hardhat run scripts/deploy.js --network bsc
```

## Environment Configuration

Add to your `.env` file:
```
VITE_CONTRACT_ADDRESS=deployed_contract_address
VITE_USDT_ADDRESS=0x55d398326f99059fF775485246999027B3197955
PRIVATE_KEY=deployment_private_key
COMMISSION_WALLET=commission_wallet_address
BSCSCAN_API_KEY=verification_api_key
```

## Contract Verification

After deployment, verify on BSCScan:
```bash
npx hardhat verify --network bsc CONTRACT_ADDRESS "USDT_ADDRESS" "COMMISSION_WALLET"
```

## Usage Examples

### Create Raffle
```typescript
await contractService.createRaffle(
  "Grand Prize Raffle",
  "Win amazing prizes!",
  "1000", // 1000 USDT prize
  "10",   // 10 USDT per ticket
  100,    // 100 max tickets
  7       // 7 days duration
);
```

### Buy Tickets
```typescript
await contractService.buyTickets(raffleId, 5); // Buy 5 tickets
```

### Create Donation
```typescript
await contractService.createDonation(
  "Help Children",
  "Support education",
  "5000", // 5000 USDT goal
  30,     // 30 days (0 for unlimited)
  0       // Individual type
);
```

### Make Donation
```typescript
await contractService.donate(donationId, "100"); // Donate 100 USDT
```

## Network Details

- **BSC Mainnet**: Chain ID 56
- **USDT Contract**: 0x55d398326f99059fF775485246999027B3197955
- **Gas Token**: BNB
- **Typical Gas Cost**: 0.001-0.005 BNB per transaction

## Migration Strategy

1. **Phase 1**: Deploy contract to testnet and test
2. **Phase 2**: Deploy to mainnet with small test transactions
3. **Phase 3**: Enable smart contract features in frontend
4. **Phase 4**: Gradual migration from mock system
5. **Phase 5**: Full smart contract operation

## Monitoring and Analytics

Track key events:
- RaffleCreated
- TicketPurchased
- RaffleEnded
- DonationCreated
- DonationMade
- CommissionPaid

## Commission Wallet Management

The commission wallet receives:
- All 25 USDT creation fees
- Platform share of raffle commissions
- All donation commissions
- Can be updated by contract owner

## Next Steps

1. Set environment variables
2. Run deployment script
3. Test on BSC testnet
4. Deploy to mainnet
5. Update frontend configuration
6. Begin testing with small amounts
7. Full production rollout

The smart contract system is now ready for deployment and provides a complete decentralized solution for the DUXXAN platform with your exact commission structure and organizational requirements.