const categories = [
  { id: 1, name: 'Elektronik' },
  { id: 2, name: 'Ev & Yaşam' }, 
  { id: 3, name: 'Moda & Aksesuar' },
  { id: 4, name: 'Spor & Outdoor' },
  { id: 5, name: 'Kitap & Hobi' },
  { id: 6, name: 'Diğer' }
];

// Fake wallet addresses from different regions
const walletsByRegion = {
  africa: [
    '0x8f2A3b9E4C7D6F1A2B8E9F3C4D5A6B7C8D9E0F1A2B3C',
    '0x7E1B9C4D6F8A2C5E9B3F7A1D4C8E2B6F9A3D7C1E5B8F',
    '0x9C4F7A2E8B1D5F3A9C6E2B8F4A7D1C5E9B3F6A8D2C7E',
    '0x5A8F2B7E1C9D4F6A3E8B2C7F1A5D9C4E6B8F3A2D7E1C',
    '0x3E7C1F5A9B2D8F4C6A1E9B7F3C5A8D2F6B4E7A1C9D5F'
  ],
  asia: [
    '0x2F8A5C7E1B9D4F6A8C2E5B7F1A4D9C3E6B8F2A5D7C1E',
    '0x6B9F3A7E2C5D8F1A4C7E9B2F5A8D1C6E3B9F7A4C2D8E',
    '0x4D7A1F8C2E9B5F3A7C1E6B8F4A2D9C5E7B1F8A3C6D2F',
    '0x8A3F6C9E2B5D7F1A4C8E6B2F9A1D5C7E3B8F4A6C2D9E',
    '0x1C5E8B3F7A2D9C4F6A8E1B5F3A7D2C9E4B6F8A1C5D7E'
  ],
  america: [
    '0x9E6F2A8C4D7B1F5A3C9E6B8F2A4D7C1E5B9F3A6C8D2E',
    '0x7C1F9A4E6B8D2F5A7C3E9B1F4A6D8C2E5B7F9A3C1D4E',
    '0x5B8A2F7C1E9D4F6A8C3E2B5F7A1D9C4E6B8F2A7C5D1E',
    '0x3F7E1C5A9B4D8F2A6C7E1B9F5A3D8C4E7B2F9A6C1D5E',
    '0x8D2F6A1C9E4B7F3A5C8E2B6F9A1D4C7E5B8F3A2C6D9E'
  ],
  russia: [
    '0x4A7E2C9F1B6D8A3F5C7E2B9F4A1D6C8E3B5F7A9C2D4E',
    '0x6C9B3F7E1A5D8C2F4A6E9B1F7A3D5C8E2B4F9A6C1D7E',
    '0x2E8F5A1C7B9D4F6A3C8E5B2F9A7D1C4E6B8F3A5C7D2E',
    '0x9F3A6C2E8B5D7F1A4C9E6B3F2A8D5C7E1B4F9A6C2D8E',
    '0x7B1E4F9A2C6D8F3A5C7E1B9F4A2D6C8E5B3F7A9C1D4E'
  ],
  middleeast: [
    '0x5C8E2B7F1A9D4C6F8A3E5B2F7A1D9C4E6B8F3A5C2D7E',
    '0x1F9A4C7E2B6D8F5A3C9E1B7F4A2D8C5E6B3F9A7C1D4E',
    '0x8A5F2C7E1B9D4F6A8C3E2B5F7A9D1C4E6B8F2A3C5D7E',
    '0x3E7B1F5A9C2D8F4C6A1E9B7F3C5A2D8F6B4E7A9C1D5F',
    '0x6D9C3A7E2F5B8D1A4C7E9B2F5A8D1C6E3B9F7A4C2D8E'
  ]
};

// Prize categories with realistic items and prices
const prizeTemplates = {
  houses: [
    { name: 'Modern Villa in Lagos', value: 85000, region: 'africa', image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=500' },
    { name: 'Luxury Apartment in Dubai', value: 120000, region: 'middleeast', image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=500' },
    { name: 'Beach House in Thailand', value: 75000, region: 'asia', image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=500' },
    { name: 'Modern Condo in São Paulo', value: 95000, region: 'america', image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500' },
    { name: 'Country House in Moscow Region', value: 110000, region: 'russia', image: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=500' }
  ],
  cars: [
    { name: 'BMW X5 2023', value: 65000, region: 'africa', image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=500' },
    { name: 'Mercedes-Benz S-Class', value: 85000, region: 'middleeast', image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=500' },
    { name: 'Audi A8 Luxury Sedan', value: 78000, region: 'asia', image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=500' },
    { name: 'Tesla Model S Plaid', value: 95000, region: 'america', image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=500' },
    { name: 'Porsche Cayenne Turbo', value: 105000, region: 'russia', image: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=500' }
  ],
  electronics: [
    { name: 'iPhone 15 Pro Max Set', value: 1500, region: 'africa', image: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=500' },
    { name: 'MacBook Pro M3 Max', value: 3500, region: 'middleeast', image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=500' },
    { name: 'Gaming Setup Complete', value: 2800, region: 'asia', image: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=500' },
    { name: 'Home Theater System', value: 4200, region: 'america', image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=500' },
    { name: 'Professional Camera Kit', value: 5500, region: 'russia', image: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=500' }
  ],
  jewelry: [
    { name: 'Diamond Necklace Set', value: 12000, region: 'africa', image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500' },
    { name: 'Gold Watch Collection', value: 18000, region: 'middleeast', image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=500' },
    { name: 'Pearl Jewelry Set', value: 8500, region: 'asia', image: 'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=500' },
    { name: 'Platinum Ring Collection', value: 15000, region: 'america', image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500' },
    { name: 'Luxury Watch Set', value: 22000, region: 'russia', image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=500' }
  ],
  land: [
    { name: '5 Hectare Farm Land', value: 45000, region: 'africa', image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=500' },
    { name: 'Desert Plot Investment', value: 35000, region: 'middleeast', image: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=500' },
    { name: 'Mountain View Plot', value: 55000, region: 'asia', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500' },
    { name: 'Beachfront Land', value: 95000, region: 'america', image: 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=500' },
    { name: 'Forest Investment Land', value: 42000, region: 'russia', image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=500' }
  ]
};

// Donation campaign templates
const donationTemplates = [
  { title: 'Clean Water for Village Schools', goal: 15000, region: 'africa', description: 'Help provide clean drinking water systems for rural schools in Kenya. Every donation helps build sustainable water infrastructure.' },
  { title: 'Emergency Medical Aid Syria', goal: 25000, region: 'middleeast', description: 'Support medical supplies and emergency care for families affected by the crisis. Urgent medical assistance needed.' },
  { title: 'Flood Relief Philippines', goal: 18000, region: 'asia', description: 'Disaster relief for communities affected by recent flooding. Food, shelter, and medical supplies urgently needed.' },
  { title: 'Education Fund Brazil', goal: 12000, region: 'america', description: 'Scholarship program for underprivileged students in São Paulo. Help provide educational opportunities and school supplies.' },
  { title: 'Winter Heating for Elderly', goal: 8500, region: 'russia', description: 'Support heating costs for elderly residents during harsh winter months. Every contribution helps keep families warm.' },
  { title: 'Orphanage Support Nigeria', goal: 22000, region: 'africa', description: 'Monthly support for children in Lagos orphanage. Food, clothing, education, and medical care for 50+ children.' },
  { title: 'Refugee Aid Lebanon', goal: 35000, region: 'middleeast', description: 'Essential supplies for refugee families. Help provide food, shelter, and basic necessities for displaced families.' },
  { title: 'Earthquake Recovery Nepal', goal: 28000, region: 'asia', description: 'Rebuild homes and schools damaged by recent earthquakes. Community reconstruction and emergency supplies needed.' }
];

// Country restrictions - Turkey and some others excluded
const restrictedCountries = ['TR', 'IR', 'SY', 'AF', 'KP'];
const allowedCountries = ['NG', 'KE', 'ZA', 'EG', 'MA', 'AE', 'SA', 'QA', 'CN', 'JP', 'KR', 'SG', 'TH', 'US', 'CA', 'BR', 'MX', 'AR', 'RU', 'KZ', 'UA'];

function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomWallet(region) {
  return getRandomElement(walletsByRegion[region]);
}

function getRandomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function getRandomSoldPercentage() {
  // Random between 15% to 85% sold
  return Math.floor(Math.random() * 70) + 15;
}

function getRandomDonationProgress() {
  // Random between 5% to 75% funded
  return Math.floor(Math.random() * 70) + 5;
}

// Generate historical raffles
const raffles = [];
const now = new Date();
const eightMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 8, 1);
const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);

for (let i = 0; i < 110; i++) {
  const allPrizes = [...prizeTemplates.houses, ...prizeTemplates.cars, ...prizeTemplates.electronics, ...prizeTemplates.jewelry, ...prizeTemplates.land];
  const prize = getRandomElement(allPrizes);
  const wallet = getRandomWallet(prize.region);
  const createdDate = getRandomDate(eightMonthsAgo, threeMonthsAgo);
  const endDate = new Date(createdDate.getTime() + (Math.random() * 30 + 7) * 24 * 60 * 60 * 1000); // 7-37 days later
  
  const maxTickets = Math.floor(Math.random() * 500) + 100; // 100-600 tickets
  const ticketPrice = Math.round((prize.value / maxTickets) * 100) / 100; // Calculate reasonable ticket price
  const soldPercentage = getRandomSoldPercentage();
  const ticketsSold = Math.floor((maxTickets * soldPercentage) / 100);
  
  raffles.push({
    creatorWallet: wallet,
    categoryId: Math.floor(Math.random() * 6) + 1,
    title: prize.name,
    description: `Exclusive opportunity to win ${prize.name}. This premium prize comes with full documentation and warranty. Limited tickets available - join now for your chance to win!`,
    prizeValue: prize.value,
    ticketPrice: ticketPrice,
    maxTickets: maxTickets,
    ticketsSold: ticketsSold,
    endDate: endDate.toISOString(),
    createdAt: createdDate.toISOString(),
    countryRestriction: 'exclude',
    excludedCountries: JSON.stringify(restrictedCountries),
    allowedCountries: JSON.stringify([]),
    image: prize.image,
    isManual: true,
    createdByAdmin: true,
    isActive: endDate < now ? false : true,
    winnerId: soldPercentage > 80 ? 1 : null // Winner selected if high participation
  });
}

// Generate historical donations
const donations = [];

for (let i = 0; i < 70; i++) {
  const template = getRandomElement(donationTemplates);
  const wallet = getRandomWallet(template.region);
  const createdDate = getRandomDate(eightMonthsAgo, threeMonthsAgo);
  const isUnlimited = Math.random() > 0.7; // 30% chance of unlimited
  const endDate = isUnlimited ? null : new Date(createdDate.getTime() + (Math.random() * 60 + 30) * 24 * 60 * 60 * 1000); // 30-90 days later
  
  const progress = getRandomDonationProgress();
  const currentAmount = Math.floor((template.goal * progress) / 100);
  
  donations.push({
    creatorWallet: wallet,
    title: template.title,
    description: template.description + ' Your contribution makes a real difference in people\'s lives. Every donation is tracked transparently on the blockchain.',
    goalAmount: template.goal,
    currentAmount: currentAmount,
    endDate: endDate ? endDate.toISOString() : null,
    createdAt: createdDate.toISOString(),
    countryRestriction: 'exclude',
    excludedCountries: JSON.stringify(restrictedCountries),
    allowedCountries: JSON.stringify([]),
    isUnlimited: isUnlimited,
    isActive: endDate ? (endDate > now) : true,
    isManual: true,
    createdByAdmin: true
  });
}

console.log(`Generated ${raffles.length} raffles and ${donations.length} donations`);
console.log('Sample raffle:', JSON.stringify(raffles[0], null, 2));
console.log('Sample donation:', JSON.stringify(donations[0], null, 2));

module.exports = { raffles, donations };