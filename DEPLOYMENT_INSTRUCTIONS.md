# BSC Mainnet Deployment Instructions

## Contract Ready for Deployment ✅

### Configuration Set
- **Commission Wallet:** `0xade7a63a8f43acec9905a85806fef36c25b6d373`
- **USDT Token:** `0x55d398326f99059fF775485246999027B3197955` (BSC Mainnet)
- **Network:** BSC Mainnet (Chain ID: 56)

### Required for Deployment

#### 1. Private Key Setup
Add your BSC mainnet private key to `.env`:
```
PRIVATE_KEY=your_private_key_here
```

#### 2. BSCScan API Key (Optional for verification)
```
BSCSCAN_API_KEY=your_api_key_here
```

### Deployment Commands

#### Deploy to BSC Mainnet
```bash
cd contracts
npx hardhat run scripts/deploy.js --network bsc
```

#### Verify on BSCScan (after deploy)
```bash
npx hardhat verify --network bsc CONTRACT_ADDRESS "0x55d398326f99059fF775485246999027B3197955" "0xade7a63a8f43acec9905a85806fef36c25b6d373"
```

### Contract Features Ready
- ✅ Raffle system with physical prizes
- ✅ Multi-signature approval system  
- ✅ Admin manual winner selection
- ✅ USDT raffle restrictions (admin only)
- ✅ 6-layer randomness generation
- ✅ BSC validator integration
- ✅ Donation system with instant transfers
- ✅ Commission structure (10% raffle, 2% donation)
- ✅ Physical prize claim (6 days, 60-40 split)
- ✅ Emergency controls and security features

### Gas Estimation
- **Deploy Cost:** ~0.005-0.01 BNB
- **Transaction Fees:** Very low on BSC (~$0.20-0.50)

### Post-Deployment Steps
1. Save contract address
2. Update frontend with contract address
3. Test basic functions (create raffle/donation)
4. Verify contract on BSCScan
5. Set up monitoring

Contract is production-ready with all security features implemented.