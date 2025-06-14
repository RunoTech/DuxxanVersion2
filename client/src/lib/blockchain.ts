import { ethers } from 'ethers';
import { walletService } from './wallet';

// Smart contract ABIs (would be generated from actual contracts)
const RAFFLE_CONTRACT_ABI = [
  'function createRaffle(uint256 ticketPrice, uint256 maxTickets, uint256 endTime) external payable',
  'function buyTickets(uint256 raffleId, uint256 quantity) external payable',
  'function drawWinner(uint256 raffleId) external',
  'function claimPrize(uint256 raffleId) external',
  'event RaffleCreated(uint256 indexed raffleId, address indexed creator)',
  'event TicketsPurchased(uint256 indexed raffleId, address indexed buyer, uint256 quantity)',
  'event WinnerDrawn(uint256 indexed raffleId, address indexed winner)'
];

const DONATION_CONTRACT_ABI = [
  'function createDonation(uint256 goalAmount, uint256 endTime) external payable',
  'function donate(uint256 donationId) external payable',
  'function withdrawDonations(uint256 donationId) external',
  'event DonationCreated(uint256 indexed donationId, address indexed creator)',
  'event DonationReceived(uint256 indexed donationId, address indexed donor, uint256 amount)'
];

const USDT_ABI = [
  'function transfer(address to, uint256 amount) external returns (bool)',
  'function approve(address spender, uint256 amount) external returns (bool)',
  'function balanceOf(address owner) view returns (uint256)',
  'function allowance(address owner, address spender) view returns (uint256)'
];

export class BlockchainService {
  private static instance: BlockchainService;
  
  // Contract addresses (would be deployed contracts)
  private RAFFLE_CONTRACT = process.env.VITE_RAFFLE_CONTRACT || '0x0000000000000000000000000000000000000000';
  private DONATION_CONTRACT = process.env.VITE_DONATION_CONTRACT || '0x0000000000000000000000000000000000000000';
  private USDT_CONTRACT = process.env.NODE_ENV === 'development' 
    ? '0x337610d27c682E347C9cD60BD4b3b107C9d34dDd' // BSC Testnet USDT
    : '0x55d398326f99059fF775485246999027B3197955'; // BSC Mainnet USDT

  static getInstance(): BlockchainService {
    if (!BlockchainService.instance) {
      BlockchainService.instance = new BlockchainService();
    }
    return BlockchainService.instance;
  }

  private getConnection() {
    const connection = walletService.getConnection();
    if (!connection) {
      throw new Error('Wallet not connected');
    }
    return connection;
  }

  // USDT operations
  async approveUSDT(spender: string, amount: string): Promise<string> {
    const { signer } = this.getConnection();
    const usdtContract = new ethers.Contract(this.USDT_CONTRACT, USDT_ABI, signer);
    
    const amountWei = ethers.parseUnits(amount, 6); // USDT has 6 decimals
    const tx = await usdtContract.approve(spender, amountWei);
    await tx.wait();
    
    return tx.hash;
  }

  async transferUSDT(to: string, amount: string): Promise<string> {
    const { signer } = this.getConnection();
    const usdtContract = new ethers.Contract(this.USDT_CONTRACT, USDT_ABI, signer);
    
    const amountWei = ethers.parseUnits(amount, 6);
    const tx = await usdtContract.transfer(to, amountWei);
    await tx.wait();
    
    return tx.hash;
  }

  async getUSDTAllowance(owner: string, spender: string): Promise<string> {
    const { provider } = this.getConnection();
    const usdtContract = new ethers.Contract(this.USDT_CONTRACT, USDT_ABI, provider);
    
    const allowance = await usdtContract.allowance(owner, spender);
    return ethers.formatUnits(allowance, 6);
  }

  // Raffle operations
  async createRaffle(ticketPrice: string, maxTickets: number, endTime: number): Promise<string> {
    const { signer } = this.getConnection();
    const raffleContract = new ethers.Contract(this.RAFFLE_CONTRACT, RAFFLE_CONTRACT_ABI, signer);
    
    // First approve USDT for the creation fee (25 USDT)
    await this.approveUSDT(this.RAFFLE_CONTRACT, '25');
    
    const ticketPriceWei = ethers.parseUnits(ticketPrice, 6);
    const tx = await raffleContract.createRaffle(ticketPriceWei, maxTickets, endTime);
    await tx.wait();
    
    return tx.hash;
  }

  async buyTickets(raffleId: number, quantity: number, ticketPrice: string): Promise<string> {
    const { signer } = this.getConnection();
    const raffleContract = new ethers.Contract(this.RAFFLE_CONTRACT, RAFFLE_CONTRACT_ABI, signer);
    
    const totalAmount = (parseFloat(ticketPrice) * quantity).toString();
    await this.approveUSDT(this.RAFFLE_CONTRACT, totalAmount);
    
    const tx = await raffleContract.buyTickets(raffleId, quantity);
    await tx.wait();
    
    return tx.hash;
  }

  // Donation operations
  async createDonation(goalAmount: string, endTime: number): Promise<string> {
    const { signer } = this.getConnection();
    const donationContract = new ethers.Contract(this.DONATION_CONTRACT, DONATION_CONTRACT_ABI, signer);
    
    // First approve USDT for the creation fee (25 USDT)
    await this.approveUSDT(this.DONATION_CONTRACT, '25');
    
    const goalAmountWei = ethers.parseUnits(goalAmount, 6);
    const tx = await donationContract.createDonation(goalAmountWei, endTime);
    await tx.wait();
    
    return tx.hash;
  }

  async donate(donationId: number, amount: string): Promise<string> {
    const { signer } = this.getConnection();
    const donationContract = new ethers.Contract(this.DONATION_CONTRACT, DONATION_CONTRACT_ABI, signer);
    
    await this.approveUSDT(this.DONATION_CONTRACT, amount);
    
    const tx = await donationContract.donate(donationId);
    await tx.wait();
    
    return tx.hash;
  }

  // Event listeners for real-time updates
  subscribeToRaffleEvents(callback: (event: any) => void) {
    const { provider } = this.getConnection();
    const raffleContract = new ethers.Contract(this.RAFFLE_CONTRACT, RAFFLE_CONTRACT_ABI, provider);
    
    raffleContract.on('RaffleCreated', (raffleId, creator, event) => {
      callback({ type: 'RaffleCreated', raffleId, creator, event });
    });
    
    raffleContract.on('TicketsPurchased', (raffleId, buyer, quantity, event) => {
      callback({ type: 'TicketsPurchased', raffleId, buyer, quantity, event });
    });
    
    raffleContract.on('WinnerDrawn', (raffleId, winner, event) => {
      callback({ type: 'WinnerDrawn', raffleId, winner, event });
    });
  }

  subscribeToDonationEvents(callback: (event: any) => void) {
    const { provider } = this.getConnection();
    const donationContract = new ethers.Contract(this.DONATION_CONTRACT, DONATION_CONTRACT_ABI, provider);
    
    donationContract.on('DonationCreated', (donationId, creator, event) => {
      callback({ type: 'DonationCreated', donationId, creator, event });
    });
    
    donationContract.on('DonationReceived', (donationId, donor, amount, event) => {
      callback({ type: 'DonationReceived', donationId, donor, amount, event });
    });
  }
}

export const blockchainService = BlockchainService.getInstance();
