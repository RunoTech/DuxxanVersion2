// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract DuxxanPlatformSimple is ReentrancyGuard, Ownable {
    IERC20 public immutable USDT;
    
    // Platform settings
    uint256 public constant RAFFLE_CREATION_FEE = 25 * 10**18; // 25 USDT
    uint256 public constant DONATION_CREATION_FEE = 25 * 10**18; // 25 USDT
    uint256 public constant RAFFLE_COMMISSION_RATE = 10; // 10%
    uint256 public constant DONATION_COMMISSION_RATE = 2; // 2%
    uint256 public constant PLATFORM_SHARE = 50; // 50% of commission
    uint256 public constant CREATOR_SHARE = 50; // 50% of commission
    
    address public commissionWallet;
    address public immutable deployWallet;
    
    // Prize types
    enum PrizeType { USDT_ONLY, PHYSICAL_ITEM }
    
    // Structs
    struct Raffle {
        uint256 id;
        address creator;
        string title;
        string description;
        uint256 prizeAmount;
        uint256 ticketPrice;
        uint256 maxTickets;
        uint256 ticketsSold;
        uint256 endTime;
        bool isActive;
        bool isCompleted;
        address winner;
        PrizeType prizeType;
        bool creatorApproved;
        bool platformApproved;
        bool payoutReleased;
    }
    
    struct Donation {
        uint256 id;
        address creator;
        string title;
        string description;
        uint256 goalAmount;
        uint256 currentAmount;
        uint256 endTime;
        bool isActive;
        bool isUnlimited;
    }
    
    // Storage
    mapping(uint256 => Raffle) public raffles;
    mapping(uint256 => Donation) public donations;
    mapping(uint256 => mapping(address => uint256)) public raffleTickets;
    mapping(uint256 => mapping(address => uint256)) public donationContributions;
    
    uint256 public raffleCounter;
    uint256 public donationCounter;
    
    // Events
    event RaffleCreated(uint256 indexed raffleId, address indexed creator, uint256 prizeAmount, PrizeType prizeType);
    event TicketPurchased(uint256 indexed raffleId, address indexed buyer, uint256 quantity);
    event RaffleEnded(uint256 indexed raffleId, address indexed winner, uint256 prizeAmount);
    event DonationCreated(uint256 indexed donationId, address indexed creator, uint256 goalAmount);
    event DonationMade(uint256 indexed donationId, address indexed donor, uint256 amount);
    event PayoutReleased(uint256 indexed raffleId, address indexed winner, uint256 amount);
    
    constructor(address _usdtToken, address _commissionWallet) Ownable(msg.sender) {
        USDT = IERC20(_usdtToken);
        commissionWallet = _commissionWallet;
        deployWallet = msg.sender;
    }
    
    // Create raffle - only deploy/commission wallets can create USDT raffles
    function createRaffle(
        string memory _title,
        string memory _description,
        uint256 _prizeAmount,
        uint256 _ticketPrice,
        uint256 _maxTickets,
        uint256 _duration,
        PrizeType _prizeType
    ) external nonReentrant {
        require(_prizeAmount > 0, "Prize amount must be greater than 0");
        require(_ticketPrice > 0, "Ticket price must be greater than 0");
        require(_maxTickets > 0, "Max tickets must be greater than 0");
        require(_duration > 0, "Duration must be greater than 0");
        
        // USDT raffle restriction
        if (_prizeType == PrizeType.USDT_ONLY) {
            require(msg.sender == deployWallet || msg.sender == commissionWallet, 
                "Only authorized wallets can create USDT raffles");
        }
        
        // Collect creation fee
        require(USDT.transferFrom(msg.sender, commissionWallet, RAFFLE_CREATION_FEE), 
            "Creation fee transfer failed");
        
        // For USDT prizes, collect the prize amount
        if (_prizeType == PrizeType.USDT_ONLY) {
            require(USDT.transferFrom(msg.sender, address(this), _prizeAmount), 
                "Prize amount transfer failed");
        }
        
        raffles[raffleCounter] = Raffle({
            id: raffleCounter,
            creator: msg.sender,
            title: _title,
            description: _description,
            prizeAmount: _prizeAmount,
            ticketPrice: _ticketPrice,
            maxTickets: _maxTickets,
            ticketsSold: 0,
            endTime: block.timestamp + _duration,
            isActive: true,
            isCompleted: false,
            winner: address(0),
            prizeType: _prizeType,
            creatorApproved: false,
            platformApproved: false,
            payoutReleased: false
        });
        
        emit RaffleCreated(raffleCounter, msg.sender, _prizeAmount, _prizeType);
        raffleCounter++;
    }
    
    // Buy raffle tickets
    function buyTickets(uint256 _raffleId, uint256 _quantity) external nonReentrant {
        Raffle storage raffle = raffles[_raffleId];
        require(raffle.isActive, "Raffle not active");
        require(block.timestamp < raffle.endTime, "Raffle ended");
        require(raffle.ticketsSold + _quantity <= raffle.maxTickets, "Not enough tickets available");
        
        uint256 totalCost = raffle.ticketPrice * _quantity;
        require(USDT.transferFrom(msg.sender, address(this), totalCost), "Payment failed");
        
        raffleTickets[_raffleId][msg.sender] += _quantity;
        raffle.ticketsSold += _quantity;
        
        emit TicketPurchased(_raffleId, msg.sender, _quantity);
    }
    
    // End raffle with simple randomness
    function endRaffle(uint256 _raffleId) external {
        Raffle storage raffle = raffles[_raffleId];
        require(raffle.isActive, "Raffle not active");
        require(block.timestamp >= raffle.endTime || raffle.ticketsSold >= raffle.maxTickets, 
            "Raffle not ready to end");
        require(msg.sender == raffle.creator || msg.sender == owner(), "Not authorized");
        
        raffle.isActive = false;
        raffle.isCompleted = true;
        
        if (raffle.ticketsSold > 0) {
            // Simple randomness for demo
            uint256 randomNum = uint256(keccak256(abi.encodePacked(
                block.timestamp, block.difficulty, block.number, _raffleId
            ))) % raffle.ticketsSold;
            
            // Find winner (simplified)
            raffle.winner = msg.sender; // For demo purposes
        }
        
        emit RaffleEnded(_raffleId, raffle.winner, raffle.prizeAmount);
    }
    
    // Approve raffle result
    function approveRaffleResult(uint256 _raffleId, bool _approve) external {
        Raffle storage raffle = raffles[_raffleId];
        require(raffle.isCompleted, "Raffle not completed");
        require(!raffle.payoutReleased, "Payout already released");
        
        if (msg.sender == raffle.creator) {
            raffle.creatorApproved = _approve;
        } else if (msg.sender == owner()) {
            raffle.platformApproved = _approve;
        } else {
            revert("Not authorized to approve");
        }
        
        // Release payout if both approved
        if (raffle.creatorApproved && raffle.platformApproved && raffle.winner != address(0)) {
            _releasePayout(_raffleId);
        }
    }
    
    // Release payout
    function _releasePayout(uint256 _raffleId) internal {
        Raffle storage raffle = raffles[_raffleId];
        require(!raffle.payoutReleased, "Already released");
        
        raffle.payoutReleased = true;
        
        uint256 totalAmount = raffle.ticketsSold * raffle.ticketPrice;
        uint256 commission = (totalAmount * RAFFLE_COMMISSION_RATE) / 100;
        uint256 platformCommission = (commission * PLATFORM_SHARE) / 100;
        uint256 creatorCommission = commission - platformCommission;
        uint256 prizeAmount = totalAmount - commission;
        
        if (raffle.prizeType == PrizeType.USDT_ONLY) {
            // Transfer original prize amount + additional prize from ticket sales
            require(USDT.transfer(raffle.winner, raffle.prizeAmount + prizeAmount), "Prize transfer failed");
        } else {
            // Physical prize - transfer USDT amount only
            require(USDT.transfer(raffle.winner, prizeAmount), "Prize transfer failed");
        }
        
        // Transfer commissions
        require(USDT.transfer(commissionWallet, platformCommission), "Platform commission failed");
        require(USDT.transfer(raffle.creator, creatorCommission), "Creator commission failed");
        
        emit PayoutReleased(_raffleId, raffle.winner, prizeAmount);
    }
    
    // Create donation
    function createDonation(
        string memory _title,
        string memory _description,
        uint256 _goalAmount,
        uint256 _duration,
        bool _isUnlimited
    ) external nonReentrant {
        require(USDT.transferFrom(msg.sender, commissionWallet, DONATION_CREATION_FEE), 
            "Creation fee transfer failed");
        
        donations[donationCounter] = Donation({
            id: donationCounter,
            creator: msg.sender,
            title: _title,
            description: _description,
            goalAmount: _goalAmount,
            currentAmount: 0,
            endTime: _isUnlimited ? 0 : block.timestamp + _duration,
            isActive: true,
            isUnlimited: _isUnlimited
        });
        
        emit DonationCreated(donationCounter, msg.sender, _goalAmount);
        donationCounter++;
    }
    
    // Make donation
    function makeDonation(uint256 _donationId, uint256 _amount) external nonReentrant {
        Donation storage donation = donations[_donationId];
        require(donation.isActive, "Donation not active");
        require(_amount > 0, "Amount must be greater than 0");
        
        if (!donation.isUnlimited) {
            require(block.timestamp < donation.endTime, "Donation period ended");
        }
        
        uint256 commission = (_amount * DONATION_COMMISSION_RATE) / 100;
        uint256 donationAmount = _amount - commission;
        
        require(USDT.transferFrom(msg.sender, donation.creator, donationAmount), "Donation transfer failed");
        require(USDT.transferFrom(msg.sender, commissionWallet, commission), "Commission transfer failed");
        
        donationContributions[_donationId][msg.sender] += _amount;
        donation.currentAmount += _amount;
        
        emit DonationMade(_donationId, msg.sender, _amount);
    }
    
    // Admin functions
    function updateCommissionWallet(address _newWallet) external onlyOwner {
        commissionWallet = _newWallet;
    }
    
    function emergencyWithdraw(address _token, uint256 _amount) external onlyOwner {
        IERC20(_token).transfer(owner(), _amount);
    }
}