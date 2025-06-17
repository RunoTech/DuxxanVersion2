// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract DuxxanPlatform is ReentrancyGuard, Ownable, Pausable {
    IERC20 public immutable USDT;
    
    // Platform settings
    uint256 public constant RAFFLE_CREATION_FEE = 25 * 10**18; // 25 USDT
    uint256 public constant DONATION_CREATION_FEE = 25 * 10**18; // 25 USDT
    uint256 public constant RAFFLE_COMMISSION_RATE = 10; // 10%
    uint256 public constant DONATION_COMMISSION_RATE = 2; // 2%
    uint256 public constant PLATFORM_SHARE = 50; // 50% of commission goes to platform
    uint256 public constant CREATOR_SHARE = 50; // 50% of commission goes to creator (only for raffles)
    
    address public commissionWallet;
    address public immutable deployWallet; // Deploy wallet address
    
    // Prize types
    enum PrizeType {
        USDT_ONLY,      // Pure USDT prize
        PHYSICAL_ITEM   // Physical item (house, car, etc.)
    }
    
    // Raffle structures
    struct Raffle {
        uint256 id;
        address creator;
        string title;
        string description;
        uint256 prizeAmount;        // USDT backing amount
        uint256 ticketPrice;
        uint256 maxTickets;
        uint256 ticketsSold;
        uint256 endTime;
        bool isActive;
        bool isCompleted;
        address winner;
        uint256 totalAmount;
        uint256 commissionCollected;
        bytes32 randomSeed; // For enhanced randomness
        uint256 seedCommitTime; // Timestamp when seed was committed
        bool creatorApproved;  // Creator approval for result
        bool platformApproved; // Platform approval for result
        bool payoutReleased;   // Whether payout has been released
        PrizeType prizeType;   // Type of prize
        string physicalPrizeDescription; // Description of physical item
        uint256 claimDeadline; // Deadline for physical prize claim
        bool prizeClaimed;     // Whether physical prize was claimed
        bool isManualWinner;   // Whether winner was manually selected by admin
    }
    
    // Donation structures
    struct Donation {
        uint256 id;
        address creator;
        string title;
        string description;
        uint256 goalAmount;
        uint256 currentAmount;
        uint256 endTime; // 0 for unlimited (organizations)
        bool isActive;
        bool isUnlimited;
        uint256 commissionCollected;
        OrganizationType orgType;
    }
    
    enum OrganizationType {
        Individual,     // Süreli
        Foundation,     // Süresiz
        Association,    // Süresiz
        Official        // Süresiz
    }
    
    // Mappings
    mapping(uint256 => Raffle) public raffles;
    mapping(uint256 => Donation) public donations;
    mapping(uint256 => mapping(address => uint256)) public raffleTickets; // raffleId => user => tickets
    mapping(uint256 => mapping(address => uint256)) public donationContributions; // donationId => user => amount
    mapping(uint256 => address[]) public raffleParticipants;
    mapping(uint256 => address[]) public donationDonors;
    
    // Enhanced randomness tracking
    mapping(uint256 => bytes32[]) private entropyHistory; // raffleId => entropy snapshots
    mapping(address => uint256) private userNonces; // user => nonce for additional entropy
    
    uint256 public raffleCounter;
    uint256 public donationCounter;
    uint256 private globalEntropySeed;
    
    // Events
    event RaffleCreated(uint256 indexed raffleId, address indexed creator, uint256 prizeAmount, uint256 ticketPrice, PrizeType prizeType);
    event TicketPurchased(uint256 indexed raffleId, address indexed buyer, uint256 quantity, uint256 totalCost);
    event RaffleEnded(uint256 indexed raffleId, address indexed winner, uint256 prizeAmount);
    event RaffleApproval(uint256 indexed raffleId, address indexed approver, bool approved);
    event PayoutReleased(uint256 indexed raffleId, address indexed winner, uint256 amount);
    event PhysicalPrizeClaimed(uint256 indexed raffleId, address indexed winner, bool claimed);
    event PhysicalPrizeExpired(uint256 indexed raffleId, address indexed winner, uint256 winnerAmount, uint256 commissionAmount);
    event ManualWinnerSelected(uint256 indexed raffleId, address indexed winner, address indexed admin);
    event DonationCreated(uint256 indexed donationId, address indexed creator, uint256 goalAmount, bool isUnlimited);
    event DonationMade(uint256 indexed donationId, address indexed donor, uint256 amount);
    event CommissionPaid(uint256 amount, address indexed recipient);
    
    constructor(address _usdtToken, address _commissionWallet) Ownable(msg.sender) {
        USDT = IERC20(_usdtToken);
        commissionWallet = _commissionWallet;
        deployWallet = msg.sender; // Store deploy wallet
        globalEntropySeed = uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.chainid,
            block.gaslimit,
            msg.sender,
            _usdtToken,
            _commissionWallet
        )));
    }
    
    modifier onlyValidRaffle(uint256 _raffleId) {
        require(_raffleId < raffleCounter, "Invalid raffle ID");
        require(raffles[_raffleId].isActive, "Raffle not active");
        require(block.timestamp < raffles[_raffleId].endTime, "Raffle ended");
        _;
    }
    
    modifier onlyValidDonation(uint256 _donationId) {
        require(_donationId < donationCounter, "Invalid donation ID");
        require(donations[_donationId].isActive, "Donation not active");
        Donation memory donation = donations[_donationId];
        require(donation.isUnlimited || block.timestamp < donation.endTime, "Donation period ended");
        _;
    }
    
    // Raffle Functions
    function createRaffle(
        string memory _title,
        string memory _description,
        uint256 _prizeAmount,
        uint256 _ticketPrice,
        uint256 _maxTickets,
        uint256 _duration,
        PrizeType _prizeType,
        string memory _physicalPrizeDescription
    ) external nonReentrant whenNotPaused {
        require(_prizeAmount > 0, "Prize amount must be positive");
        require(_ticketPrice >= 1 * 10**18, "Minimum ticket price is 1 USDT"); // 1 USDT minimum
        require(_maxTickets > 0, "Max tickets must be positive");
        require(_duration > 0, "Duration must be positive");
        
        // USDT_ONLY raffles can only be created by deploy wallet or commission wallet
        if (_prizeType == PrizeType.USDT_ONLY) {
            require(
                msg.sender == deployWallet || msg.sender == commissionWallet,
                "Only deploy or commission wallet can create USDT raffles"
            );
        }
        
        // Transfer creation fee to commission wallet
        require(USDT.transferFrom(msg.sender, commissionWallet, RAFFLE_CREATION_FEE), "Fee transfer failed");
        
        // Transfer prize amount to contract
        require(USDT.transferFrom(msg.sender, address(this), _prizeAmount), "Prize transfer failed");
        
        uint256 raffleId = raffleCounter++;
        uint256 claimDeadline = (_prizeType == PrizeType.PHYSICAL_ITEM) ? 
            block.timestamp + _duration + 6 days : 0; // 6 days after raffle ends to claim physical prize
        
        raffles[raffleId] = Raffle({
            id: raffleId,
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
            totalAmount: 0,
            commissionCollected: 0,
            randomSeed: keccak256(abi.encodePacked(block.timestamp, block.chainid, block.gaslimit, msg.sender, raffleId)),
            seedCommitTime: block.timestamp,
            creatorApproved: false,
            platformApproved: false,
            payoutReleased: false,
            prizeType: _prizeType,
            physicalPrizeDescription: _physicalPrizeDescription,
            claimDeadline: claimDeadline,
            prizeClaimed: false,
            isManualWinner: false
        });
        
        emit RaffleCreated(raffleId, msg.sender, _prizeAmount, _ticketPrice, _prizeType);
    }
    
    function buyTickets(uint256 _raffleId, uint256 _quantity) external nonReentrant onlyValidRaffle(_raffleId) {
        Raffle storage raffle = raffles[_raffleId];
        require(_quantity > 0, "Quantity must be positive");
        require(raffle.ticketsSold + _quantity <= raffle.maxTickets, "Not enough tickets available");
        
        uint256 totalCost = raffle.ticketPrice * _quantity;
        uint256 commission = (totalCost * RAFFLE_COMMISSION_RATE) / 100;
        uint256 platformCommission = (commission * PLATFORM_SHARE) / 100;
        uint256 creatorCommission = commission - platformCommission;
        
        // Transfer payment
        require(USDT.transferFrom(msg.sender, address(this), totalCost), "Payment failed");
        
        // Distribute commissions
        require(USDT.transfer(commissionWallet, platformCommission), "Platform commission failed");
        require(USDT.transfer(raffle.creator, creatorCommission), "Creator commission failed");
        
        // Update raffle state and collect entropy
        if (raffleTickets[_raffleId][msg.sender] == 0) {
            raffleParticipants[_raffleId].push(msg.sender);
        }
        
        // Collect entropy from each ticket purchase
        bytes32 purchaseEntropy = keccak256(abi.encodePacked(
            msg.sender,
            _quantity,
            block.timestamp,
            userNonces[msg.sender]++,
            globalEntropySeed
        ));
        entropyHistory[_raffleId].push(purchaseEntropy);
        globalEntropySeed = uint256(keccak256(abi.encodePacked(globalEntropySeed, purchaseEntropy)));
        
        raffleTickets[_raffleId][msg.sender] += _quantity;
        raffle.ticketsSold += _quantity;
        raffle.totalAmount += totalCost;
        raffle.commissionCollected += commission;
        
        emit TicketPurchased(_raffleId, msg.sender, _quantity, totalCost);
        
        // Auto-end if all tickets sold
        if (raffle.ticketsSold == raffle.maxTickets) {
            _endRaffleWithApproval(_raffleId);
        }
    }
    
    function endRaffle(uint256 _raffleId) external {
        require(_raffleId < raffleCounter, "Invalid raffle ID");
        Raffle storage raffle = raffles[_raffleId];
        require(raffle.isActive, "Raffle not active");
        require(
            block.timestamp >= raffle.endTime || 
            msg.sender == raffle.creator || 
            msg.sender == owner(),
            "Cannot end raffle yet"
        );
        
        _endRaffleWithApproval(_raffleId);
    }
    
    function _endRaffle(uint256 _raffleId) internal {
        Raffle storage raffle = raffles[_raffleId];
        require(!raffle.isCompleted, "Raffle already completed");
        
        raffle.isActive = false;
        raffle.isCompleted = true;
        
        if (raffle.ticketsSold > 0) {
            // Advanced multi-layer randomness system
            address[] memory participants = raffleParticipants[_raffleId];
            uint256 totalTickets = raffle.ticketsSold;
            
            // Layer 1: Time-delayed seed evolution
            bytes32 evolvedSeed = keccak256(abi.encodePacked(
                raffle.randomSeed,
                block.timestamp - raffle.seedCommitTime,
                block.number
            ));
            
            // Layer 2: Participant-influenced entropy
            bytes32 participantEntropy = keccak256(abi.encodePacked(
                participants[0], // First participant
                participants[participants.length - 1], // Last participant
                participants.length,
                raffle.totalAmount
            ));
            
            // Layer 3: Block-based entropy with BSC-optimized data
            bytes32 blockEntropy = keccak256(abi.encodePacked(
                blockhash(block.number - 1),
                blockhash(block.number - 2),
                block.chainid,        // BSC chain ID: 56
                block.gaslimit,       // Block gas limit
                block.coinbase,       // BSC validator address
                block.timestamp,
                gasleft()
            ));
            
            // Layer 4: Transaction context entropy
            bytes32 txEntropy = keccak256(abi.encodePacked(
                tx.origin,
                msg.sender,
                tx.gasprice,
                _raffleId
            ));
            
            // Layer 5: Historical entropy from all ticket purchases
            bytes32 historicalEntropy = bytes32(0);
            bytes32[] memory history = entropyHistory[_raffleId];
            for (uint256 i = 0; i < history.length; i++) {
                historicalEntropy = keccak256(abi.encodePacked(historicalEntropy, history[i]));
            }
            
            // Layer 6: Global entropy evolution with BSC validator system
            bytes32 globalEntropy = keccak256(abi.encodePacked(
                globalEntropySeed,
                raffleCounter,
                donationCounter,
                block.number % 21,    // BSC 21 validator rotation cycle
                block.coinbase        // Current BSC validator
            ));
            
            // Combine all entropy layers with multiple hash rounds
            uint256 finalEntropy = uint256(keccak256(abi.encodePacked(
                evolvedSeed,
                participantEntropy,
                blockEntropy,
                txEntropy,
                historicalEntropy,
                globalEntropy
            )));
            
            // Apply triple hashing for cryptographic security
            finalEntropy = uint256(keccak256(abi.encodePacked(finalEntropy, block.timestamp)));
            finalEntropy = uint256(keccak256(abi.encodePacked(finalEntropy, block.number)));
            finalEntropy = uint256(keccak256(abi.encodePacked(finalEntropy, gasleft())));
            
            // Use large prime multiplication for uniform distribution
            uint256 winningTicket = (finalEntropy * 2654435761) % totalTickets;
            
            // Find winner based on ticket distribution
            uint256 ticketCount = 0;
            for (uint256 i = 0; i < participants.length; i++) {
                ticketCount += raffleTickets[_raffleId][participants[i]];
                if (winningTicket < ticketCount) {
                    raffle.winner = participants[i];
                    break;
                }
            }
            
            emit RaffleEnded(_raffleId, raffle.winner, raffle.prizeAmount);
            
            // Handle payout based on prize type
            if (raffle.prizeType == PrizeType.USDT_ONLY) {
                // Direct USDT transfer
                require(USDT.transfer(raffle.winner, raffle.prizeAmount), "Prize transfer failed");
                raffle.payoutReleased = true;
                emit PayoutReleased(_raffleId, raffle.winner, raffle.prizeAmount);
            }
            // For physical prizes, wait for claim confirmation
        } else {
            // No tickets sold, return prize to creator
            require(USDT.transfer(raffle.creator, raffle.prizeAmount), "Prize return failed");
            emit RaffleEnded(_raffleId, address(0), 0);
        }
    }
    
    // Admin function to manually select winner (only for deploy/commission wallet created raffles)
    function selectManualWinner(uint256 _raffleId, address _winner) external {
        require(_raffleId < raffleCounter, "Invalid raffle ID");
        Raffle storage raffle = raffles[_raffleId];
        require(raffle.isActive, "Raffle not active");
        require(
            msg.sender == deployWallet || msg.sender == commissionWallet,
            "Only deploy or commission wallet can select manual winner"
        );
        require(
            raffle.creator == deployWallet || raffle.creator == commissionWallet,
            "Manual selection only for admin-created raffles"
        );
        require(_winner != address(0), "Invalid winner address");
        require(raffleTickets[_raffleId][_winner] > 0, "Winner must have tickets");
        
        // End raffle with manual winner
        raffle.isActive = false;
        raffle.isCompleted = true;
        raffle.winner = _winner;
        raffle.isManualWinner = true;
        
        emit RaffleEnded(_raffleId, _winner, raffle.prizeAmount);
        emit ManualWinnerSelected(_raffleId, _winner, msg.sender);
        
        // Handle payout based on prize type
        if (raffle.prizeType == PrizeType.USDT_ONLY) {
            // Direct USDT transfer for manual selection
            require(USDT.transfer(raffle.winner, raffle.prizeAmount), "Prize transfer failed");
            raffle.payoutReleased = true;
            raffle.creatorApproved = true; // Auto-approve for admin selection
            raffle.platformApproved = true; // Auto-approve for admin selection
            emit PayoutReleased(_raffleId, raffle.winner, raffle.prizeAmount);
        }
        // For physical prizes, still need approvals
    }
    
    // Multi-signature approval system for raffle results
    function approveRaffleResult(uint256 _raffleId, bool _approve) external {
        require(_raffleId < raffleCounter, "Invalid raffle ID");
        Raffle storage raffle = raffles[_raffleId];
        require(raffle.isCompleted, "Raffle not completed");
        require(!raffle.payoutReleased, "Payout already released");
        require(raffle.winner != address(0), "No winner determined");
        
        if (msg.sender == raffle.creator) {
            raffle.creatorApproved = _approve;
            emit RaffleApproval(_raffleId, msg.sender, _approve);
        } else if (msg.sender == raffle.winner) {
            raffle.platformApproved = _approve; // Winner approval stored in platformApproved
            emit RaffleApproval(_raffleId, msg.sender, _approve);
        } else {
            revert("Only creator or winner can approve");
        }
        
        // Check if both parties approved and release payout
        if (raffle.creatorApproved && raffle.platformApproved) {
            _releasePayout(_raffleId);
        }
    }
    
    function _releasePayout(uint256 _raffleId) internal {
        Raffle storage raffle = raffles[_raffleId];
        require(!raffle.payoutReleased, "Payout already released");
        
        if (raffle.prizeType == PrizeType.USDT_ONLY) {
            // Direct USDT transfer to winner
            require(USDT.transfer(raffle.winner, raffle.prizeAmount), "Prize transfer failed");
            raffle.payoutReleased = true;
            emit PayoutReleased(_raffleId, raffle.winner, raffle.prizeAmount);
        } else if (raffle.prizeType == PrizeType.PHYSICAL_ITEM) {
            // For physical prizes, just mark as approved for claim process
            raffle.payoutReleased = false; // Keep false until physical claim is processed
            emit PayoutReleased(_raffleId, raffle.winner, 0); // 0 amount indicates approval for physical claim
        }
    }
    
    // Override the _endRaffle function to require approvals
    function _endRaffleWithApproval(uint256 _raffleId) internal {
        Raffle storage raffle = raffles[_raffleId];
        require(!raffle.isCompleted, "Raffle already completed");
        
        raffle.isActive = false;
        raffle.isCompleted = true;
        
        if (raffle.ticketsSold > 0) {
            // Advanced multi-layer randomness system (same as before)
            address[] memory participants = raffleParticipants[_raffleId];
            uint256 totalTickets = raffle.ticketsSold;
            
            // Layer 1: Time-delayed seed evolution
            bytes32 evolvedSeed = keccak256(abi.encodePacked(
                raffle.randomSeed,
                block.timestamp - raffle.seedCommitTime,
                block.number
            ));
            
            // Layer 2: Participant-influenced entropy
            bytes32 participantEntropy = keccak256(abi.encodePacked(
                participants[0], // First participant
                participants[participants.length - 1], // Last participant
                participants.length,
                raffle.totalAmount
            ));
            
            // Layer 3: Block-based entropy with BSC-optimized data
            bytes32 blockEntropy = keccak256(abi.encodePacked(
                blockhash(block.number - 1),
                blockhash(block.number - 2),
                block.chainid,        // BSC chain ID: 56
                block.gaslimit,       // Block gas limit
                block.coinbase,       // BSC validator address
                block.timestamp,
                gasleft()
            ));
            
            // Layer 4: Purchase history entropy
            bytes32 historyEntropy = bytes32(0);
            uint256 historyLength = entropyHistory[_raffleId].length;
            if (historyLength > 0) {
                for (uint256 i = 0; i < historyLength && i < 10; i++) {
                    historyEntropy = keccak256(abi.encodePacked(historyEntropy, entropyHistory[_raffleId][i]));
                }
            }
            
            // Layer 5: BSC validator-specific entropy
            bytes32 validatorEntropy = keccak256(abi.encodePacked(
                block.number % 21,    // BSC 21 validator rotation cycle
                block.coinbase        // Current BSC validator
            ));
            
            // Layer 6: Final entropy combination with triple hashing
            uint256 finalEntropy = uint256(keccak256(abi.encodePacked(
                evolvedSeed,
                participantEntropy,
                blockEntropy,
                historyEntropy,
                validatorEntropy,
                globalEntropySeed
            )));
            
            // Additional randomness layers
            finalEntropy = uint256(keccak256(abi.encodePacked(finalEntropy, block.timestamp)));
            finalEntropy = uint256(keccak256(abi.encodePacked(finalEntropy, block.number)));
            finalEntropy = uint256(keccak256(abi.encodePacked(finalEntropy, gasleft())));
            
            // Use large prime multiplication for uniform distribution
            uint256 winningTicket = (finalEntropy * 2654435761) % totalTickets;
            
            // Find winner based on ticket distribution
            uint256 ticketCount = 0;
            for (uint256 i = 0; i < participants.length; i++) {
                ticketCount += raffleTickets[_raffleId][participants[i]];
                if (winningTicket < ticketCount) {
                    raffle.winner = participants[i];
                    break;
                }
            }
            
            emit RaffleEnded(_raffleId, raffle.winner, raffle.prizeAmount);
            
            // DO NOT release payout automatically - wait for both approvals
            
        } else {
            // No tickets sold, return prize to creator
            require(USDT.transfer(raffle.creator, raffle.prizeAmount), "Prize return failed");
            emit RaffleEnded(_raffleId, address(0), 0);
        }
    }
    
    // Physical Prize Management Functions
    function claimPhysicalPrize(uint256 _raffleId, bool _claimed) external {
        require(_raffleId < raffleCounter, "Invalid raffle ID");
        Raffle storage raffle = raffles[_raffleId];
        require(raffle.isCompleted, "Raffle not completed");
        require(raffle.prizeType == PrizeType.PHYSICAL_ITEM, "Not a physical prize");
        require(msg.sender == raffle.winner, "Only winner can claim");
        require(block.timestamp <= raffle.claimDeadline, "Claim deadline passed");
        require(raffle.creatorApproved && raffle.platformApproved, "Both parties must approve first");
        require(!raffle.payoutReleased, "Payout already released");
        
        raffle.prizeClaimed = _claimed;
        
        if (_claimed) {
            // Winner claims physical prize, creator gets the USDT
            require(USDT.transfer(raffle.creator, raffle.prizeAmount), "Creator payout failed");
            raffle.payoutReleased = true;
            emit PhysicalPrizeClaimed(_raffleId, raffle.winner, true);
            emit PayoutReleased(_raffleId, raffle.creator, raffle.prizeAmount);
        } else {
            // Winner rejects physical prize, gets 60% of USDT
            uint256 winnerAmount = (raffle.prizeAmount * 60) / 100;
            uint256 commissionAmount = raffle.prizeAmount - winnerAmount;
            
            require(USDT.transfer(raffle.winner, winnerAmount), "Winner payout failed");
            require(USDT.transfer(commissionWallet, commissionAmount), "Commission payout failed");
            
            raffle.payoutReleased = true;
            emit PhysicalPrizeClaimed(_raffleId, raffle.winner, false);
            emit PayoutReleased(_raffleId, raffle.winner, winnerAmount);
            emit CommissionPaid(commissionAmount, commissionWallet);
        }
    }
    
    function expirePhysicalPrize(uint256 _raffleId) external {
        require(_raffleId < raffleCounter, "Invalid raffle ID");
        Raffle storage raffle = raffles[_raffleId];
        require(raffle.isCompleted, "Raffle not completed");
        require(raffle.prizeType == PrizeType.PHYSICAL_ITEM, "Not a physical prize");
        require(block.timestamp > raffle.claimDeadline, "Claim period still active");
        require(raffle.creatorApproved && raffle.platformApproved, "Both parties must approve first");
        require(!raffle.payoutReleased, "Payout already released");
        
        // Deadline passed without claim, winner gets 60% of USDT
        uint256 winnerAmount = (raffle.prizeAmount * 60) / 100;
        uint256 commissionAmount = raffle.prizeAmount - winnerAmount;
        
        require(USDT.transfer(raffle.winner, winnerAmount), "Winner payout failed");
        require(USDT.transfer(commissionWallet, commissionAmount), "Commission payout failed");
        
        raffle.payoutReleased = true;
        emit PhysicalPrizeExpired(_raffleId, raffle.winner, winnerAmount, commissionAmount);
        emit PayoutReleased(_raffleId, raffle.winner, winnerAmount);
        emit CommissionPaid(commissionAmount, commissionWallet);
    }
    
    // Donation Functions
    function createDonation(
        string memory _title,
        string memory _description,
        uint256 _goalAmount,
        uint256 _duration,
        OrganizationType _orgType
    ) external nonReentrant whenNotPaused {
        require(_goalAmount > 0, "Goal amount must be positive");
        
        // Organizations can create unlimited donations, individuals must have duration
        bool isUnlimited = (_orgType != OrganizationType.Individual);
        if (!isUnlimited) {
            require(_duration > 0, "Individual donations must have duration");
        }
        
        // Transfer creation fee to commission wallet
        require(USDT.transferFrom(msg.sender, commissionWallet, DONATION_CREATION_FEE), "Fee transfer failed");
        
        uint256 donationId = donationCounter++;
        uint256 endTime = isUnlimited ? 0 : block.timestamp + _duration;
        
        donations[donationId] = Donation({
            id: donationId,
            creator: msg.sender,
            title: _title,
            description: _description,
            goalAmount: _goalAmount,
            currentAmount: 0,
            endTime: endTime,
            isActive: true,
            isUnlimited: isUnlimited,
            commissionCollected: 0,
            orgType: _orgType
        });
        
        emit DonationCreated(donationId, msg.sender, _goalAmount, isUnlimited);
    }
    
    function donate(uint256 _donationId, uint256 _amount) external nonReentrant onlyValidDonation(_donationId) {
        require(_amount >= 10 * 10**18, "Minimum donation is 10 USDT"); // 10 USDT minimum
        
        Donation storage donation = donations[_donationId];
        uint256 commission = (_amount * DONATION_COMMISSION_RATE) / 100;
        uint256 netAmount = _amount - commission;
        
        // Transfer full amount from donor (including commission)
        require(USDT.transferFrom(msg.sender, address(this), _amount), "Transfer failed");
        
        // Send commission to platform
        require(USDT.transfer(commissionWallet, commission), "Commission transfer failed");
        
        // Send net amount directly to donation creator (instant transfer)
        require(USDT.transfer(donation.creator, netAmount), "Donation transfer failed");
        
        // Update donation state
        if (donationContributions[_donationId][msg.sender] == 0) {
            donationDonors[_donationId].push(msg.sender);
        }
        
        // Track the net amount that goes to the campaign
        donationContributions[_donationId][msg.sender] += netAmount;
        donation.currentAmount += netAmount; // Only count net amount towards goal
        donation.commissionCollected += commission;
        
        emit DonationMade(_donationId, msg.sender, netAmount); // Emit net amount
        emit CommissionPaid(commission, commissionWallet);
    }
    
    // View Functions
    function getRaffle(uint256 _raffleId) external view returns (Raffle memory) {
        require(_raffleId < raffleCounter, "Invalid raffle ID");
        return raffles[_raffleId];
    }
    
    function getDonation(uint256 _donationId) external view returns (Donation memory) {
        require(_donationId < donationCounter, "Invalid donation ID");
        return donations[_donationId];
    }
    
    function getRaffleParticipants(uint256 _raffleId) external view returns (address[] memory) {
        return raffleParticipants[_raffleId];
    }
    
    function getDonationDonors(uint256 _donationId) external view returns (address[] memory) {
        return donationDonors[_donationId];
    }
    
    function getUserTickets(uint256 _raffleId, address _user) external view returns (uint256) {
        return raffleTickets[_raffleId][_user];
    }
    
    function getUserDonations(uint256 _donationId, address _user) external view returns (uint256) {
        return donationContributions[_donationId][_user];
    }
    
    // Admin Functions
    function setCommissionWallet(address _newWallet) external onlyOwner {
        require(_newWallet != address(0), "Invalid wallet address");
        commissionWallet = _newWallet;
    }
    
    // View function to check if address can create USDT raffles
    function canCreateUSDTRaffle(address _user) external view returns (bool) {
        return _user == deployWallet || _user == commissionWallet;
    }
    
    // View function to check if address can manually select winner
    function canSelectManualWinner(address _user, uint256 _raffleId) external view returns (bool) {
        if (_raffleId >= raffleCounter) return false;
        Raffle storage raffle = raffles[_raffleId];
        
        bool isAdmin = (_user == deployWallet || _user == commissionWallet);
        bool isAdminRaffle = (raffle.creator == deployWallet || raffle.creator == commissionWallet);
        
        return isAdmin && isAdminRaffle && raffle.isActive;
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    function emergencyWithdraw(address _token, uint256 _amount) external onlyOwner {
        if (_token == address(0)) {
            payable(owner()).transfer(_amount);
        } else {
            IERC20(_token).transfer(owner(), _amount);
        }
    }
    
    // Get active raffles and donations
    function getActiveRafflesCount() external view returns (uint256) {
        uint256 count = 0;
        for (uint256 i = 0; i < raffleCounter; i++) {
            if (raffles[i].isActive && block.timestamp < raffles[i].endTime) {
                count++;
            }
        }
        return count;
    }
    
    function getActiveDonationsCount() external view returns (uint256) {
        uint256 count = 0;
        for (uint256 i = 0; i < donationCounter; i++) {
            Donation memory donation = donations[i];
            if (donation.isActive && (donation.isUnlimited || block.timestamp < donation.endTime)) {
                count++;
            }
        }
        return count;
    }
}