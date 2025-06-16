export const DUXXAN_CONTRACT_ABI = [
  {
    "inputs": [
      {"internalType": "address", "name": "_usdtToken", "type": "address"},
      {"internalType": "address", "name": "_commissionWallet", "type": "address"}
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "uint256", "name": "amount", "type": "uint256"},
      {"indexed": true, "internalType": "address", "name": "recipient", "type": "address"}
    ],
    "name": "CommissionPaid",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "uint256", "name": "donationId", "type": "uint256"},
      {"indexed": true, "internalType": "address", "name": "creator", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "goalAmount", "type": "uint256"},
      {"indexed": false, "internalType": "bool", "name": "isUnlimited", "type": "bool"}
    ],
    "name": "DonationCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "uint256", "name": "donationId", "type": "uint256"},
      {"indexed": true, "internalType": "address", "name": "donor", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "DonationMade",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "previousOwner", "type": "address"},
      {"indexed": true, "internalType": "address", "name": "newOwner", "type": "address"}
    ],
    "name": "OwnershipTransferred",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": false, "internalType": "address", "name": "account", "type": "address"}
    ],
    "name": "Paused",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "uint256", "name": "raffleId", "type": "uint256"},
      {"indexed": true, "internalType": "address", "name": "creator", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "prizeAmount", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "ticketPrice", "type": "uint256"}
    ],
    "name": "RaffleCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "uint256", "name": "raffleId", "type": "uint256"},
      {"indexed": true, "internalType": "address", "name": "winner", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "prizeAmount", "type": "uint256"}
    ],
    "name": "RaffleEnded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "uint256", "name": "raffleId", "type": "uint256"},
      {"indexed": true, "internalType": "address", "name": "buyer", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "quantity", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "totalCost", "type": "uint256"}
    ],
    "name": "TicketPurchased",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": false, "internalType": "address", "name": "account", "type": "address"}
    ],
    "name": "Unpaused",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "CREATOR_SHARE",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "DONATION_COMMISSION_RATE",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "DONATION_CREATION_FEE",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "PLATFORM_SHARE",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "RAFFLE_COMMISSION_RATE",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "RAFFLE_CREATION_FEE",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "USDT",
    "outputs": [{"internalType": "contract IERC20", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "_raffleId", "type": "uint256"},
      {"internalType": "uint256", "name": "_quantity", "type": "uint256"}
    ],
    "name": "buyTickets",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "commissionWallet",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "string", "name": "_title", "type": "string"},
      {"internalType": "string", "name": "_description", "type": "string"},
      {"internalType": "uint256", "name": "_goalAmount", "type": "uint256"},
      {"internalType": "uint256", "name": "_duration", "type": "uint256"},
      {"internalType": "enum DuxxanPlatform.OrganizationType", "name": "_orgType", "type": "uint8"}
    ],
    "name": "createDonation",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "string", "name": "_title", "type": "string"},
      {"internalType": "string", "name": "_description", "type": "string"},
      {"internalType": "uint256", "name": "_prizeAmount", "type": "uint256"},
      {"internalType": "uint256", "name": "_ticketPrice", "type": "uint256"},
      {"internalType": "uint256", "name": "_maxTickets", "type": "uint256"},
      {"internalType": "uint256", "name": "_duration", "type": "uint256"}
    ],
    "name": "createRaffle",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "_donationId", "type": "uint256"},
      {"internalType": "uint256", "name": "_amount", "type": "uint256"}
    ],
    "name": "donate",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "", "type": "uint256"},
      {"internalType": "address", "name": "", "type": "address"}
    ],
    "name": "donationContributions",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "donationCounter",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "", "type": "uint256"},
      {"internalType": "uint256", "name": "", "type": "uint256"}
    ],
    "name": "donationDonors",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "name": "donations",
    "outputs": [
      {"internalType": "uint256", "name": "id", "type": "uint256"},
      {"internalType": "address", "name": "creator", "type": "address"},
      {"internalType": "string", "name": "title", "type": "string"},
      {"internalType": "string", "name": "description", "type": "string"},
      {"internalType": "uint256", "name": "goalAmount", "type": "uint256"},
      {"internalType": "uint256", "name": "currentAmount", "type": "uint256"},
      {"internalType": "uint256", "name": "endTime", "type": "uint256"},
      {"internalType": "bool", "name": "isActive", "type": "bool"},
      {"internalType": "bool", "name": "isUnlimited", "type": "bool"},
      {"internalType": "uint256", "name": "commissionCollected", "type": "uint256"},
      {"internalType": "enum DuxxanPlatform.OrganizationType", "name": "orgType", "type": "uint8"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "_token", "type": "address"},
      {"internalType": "uint256", "name": "_amount", "type": "uint256"}
    ],
    "name": "emergencyWithdraw",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_raffleId", "type": "uint256"}],
    "name": "endRaffle",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getActiveDonationsCount",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getActiveRafflesCount",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_donationId", "type": "uint256"}],
    "name": "getDonation",
    "outputs": [
      {
        "components": [
          {"internalType": "uint256", "name": "id", "type": "uint256"},
          {"internalType": "address", "name": "creator", "type": "address"},
          {"internalType": "string", "name": "title", "type": "string"},
          {"internalType": "string", "name": "description", "type": "string"},
          {"internalType": "uint256", "name": "goalAmount", "type": "uint256"},
          {"internalType": "uint256", "name": "currentAmount", "type": "uint256"},
          {"internalType": "uint256", "name": "endTime", "type": "uint256"},
          {"internalType": "bool", "name": "isActive", "type": "bool"},
          {"internalType": "bool", "name": "isUnlimited", "type": "bool"},
          {"internalType": "uint256", "name": "commissionCollected", "type": "uint256"},
          {"internalType": "enum DuxxanPlatform.OrganizationType", "name": "orgType", "type": "uint8"}
        ],
        "internalType": "struct DuxxanPlatform.Donation",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_donationId", "type": "uint256"}],
    "name": "getDonationDonors",
    "outputs": [{"internalType": "address[]", "name": "", "type": "address[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_raffleId", "type": "uint256"}],
    "name": "getRaffle",
    "outputs": [
      {
        "components": [
          {"internalType": "uint256", "name": "id", "type": "uint256"},
          {"internalType": "address", "name": "creator", "type": "address"},
          {"internalType": "string", "name": "title", "type": "string"},
          {"internalType": "string", "name": "description", "type": "string"},
          {"internalType": "uint256", "name": "prizeAmount", "type": "uint256"},
          {"internalType": "uint256", "name": "ticketPrice", "type": "uint256"},
          {"internalType": "uint256", "name": "maxTickets", "type": "uint256"},
          {"internalType": "uint256", "name": "ticketsSold", "type": "uint256"},
          {"internalType": "uint256", "name": "endTime", "type": "uint256"},
          {"internalType": "bool", "name": "isActive", "type": "bool"},
          {"internalType": "bool", "name": "isCompleted", "type": "bool"},
          {"internalType": "address", "name": "winner", "type": "address"},
          {"internalType": "uint256", "name": "totalAmount", "type": "uint256"},
          {"internalType": "uint256", "name": "commissionCollected", "type": "uint256"}
        ],
        "internalType": "struct DuxxanPlatform.Raffle",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_raffleId", "type": "uint256"}],
    "name": "getRaffleParticipants",
    "outputs": [{"internalType": "address[]", "name": "", "type": "address[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "_donationId", "type": "uint256"},
      {"internalType": "address", "name": "_user", "type": "address"}
    ],
    "name": "getUserDonations",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "_raffleId", "type": "uint256"},
      {"internalType": "address", "name": "_user", "type": "address"}
    ],
    "name": "getUserTickets",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "pause",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "paused",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "raffleCounter",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "", "type": "uint256"},
      {"internalType": "uint256", "name": "", "type": "uint256"}
    ],
    "name": "raffleParticipants",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "", "type": "uint256"},
      {"internalType": "address", "name": "", "type": "address"}
    ],
    "name": "raffleTickets",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "name": "raffles",
    "outputs": [
      {"internalType": "uint256", "name": "id", "type": "uint256"},
      {"internalType": "address", "name": "creator", "type": "address"},
      {"internalType": "string", "name": "title", "type": "string"},
      {"internalType": "string", "name": "description", "type": "string"},
      {"internalType": "uint256", "name": "prizeAmount", "type": "uint256"},
      {"internalType": "uint256", "name": "ticketPrice", "type": "uint256"},
      {"internalType": "uint256", "name": "maxTickets", "type": "uint256"},
      {"internalType": "uint256", "name": "ticketsSold", "type": "uint256"},
      {"internalType": "uint256", "name": "endTime", "type": "uint256"},
      {"internalType": "bool", "name": "isActive", "type": "bool"},
      {"internalType": "bool", "name": "isCompleted", "type": "bool"},
      {"internalType": "address", "name": "winner", "type": "address"},
      {"internalType": "uint256", "name": "totalAmount", "type": "uint256"},
      {"internalType": "uint256", "name": "commissionCollected", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "renounceOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_newWallet", "type": "address"}],
    "name": "setCommissionWallet",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "newOwner", "type": "address"}],
    "name": "transferOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "unpause",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];