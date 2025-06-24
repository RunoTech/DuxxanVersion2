import fetch from 'node-fetch';

const baseURL = 'http://localhost:5000';

// Gerçekçi cüzdan adresleri - bölgelere göre
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

// Çekiliş şablonları - gerçek fiyatlarla
const raffleTemplates = [
  // Evler
  { name: 'Modern Villa Lagos Nigeria', value: 85000, ticketPrice: 145, maxTickets: 600, region: 'africa', categoryId: 2, image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=500' },
  { name: 'Luxury Apartment Dubai UAE', value: 120000, ticketPrice: 195, maxTickets: 650, region: 'middleeast', categoryId: 2, image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=500' },
  { name: 'Beach House Phuket Thailand', value: 75000, ticketPrice: 125, maxTickets: 650, region: 'asia', categoryId: 2, image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=500' },
  { name: 'Modern Condo São Paulo Brazil', value: 95000, ticketPrice: 155, maxTickets: 650, region: 'america', categoryId: 2, image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500' },
  { name: 'Country House Moscow Region', value: 110000, ticketPrice: 175, maxTickets: 650, region: 'russia', categoryId: 2, image: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=500' },
  
  // Arabalar
  { name: 'BMW X5 2023 Model', value: 65000, ticketPrice: 85, maxTickets: 780, region: 'africa', categoryId: 6, image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=500' },
  { name: 'Mercedes-Benz S-Class 2024', value: 85000, ticketPrice: 115, maxTickets: 750, region: 'middleeast', categoryId: 6, image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=500' },
  { name: 'Audi A8 Luxury Sedan', value: 78000, ticketPrice: 95, maxTickets: 850, region: 'asia', categoryId: 6, image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=500' },
  { name: 'Tesla Model S Plaid', value: 95000, ticketPrice: 125, maxTickets: 780, region: 'america', categoryId: 6, image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=500' },
  { name: 'Porsche Cayenne Turbo', value: 105000, ticketPrice: 135, maxTickets: 800, region: 'russia', categoryId: 6, image: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=500' },
  
  // Elektronik
  { name: 'iPhone 15 Pro Max Complete Set', value: 1500, ticketPrice: 8, maxTickets: 200, region: 'africa', categoryId: 1, image: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=500' },
  { name: 'MacBook Pro M3 Max 16-inch', value: 3500, ticketPrice: 18, maxTickets: 200, region: 'middleeast', categoryId: 1, image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=500' },
  { name: 'Gaming Setup Complete RTX 4090', value: 2800, ticketPrice: 15, maxTickets: 190, region: 'asia', categoryId: 1, image: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=500' },
  { name: 'Home Theater System Premium', value: 4200, ticketPrice: 22, maxTickets: 195, region: 'america', categoryId: 1, image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=500' },
  { name: 'Professional Camera Kit Sony', value: 5500, ticketPrice: 28, maxTickets: 200, region: 'russia', categoryId: 1, image: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=500' },
  
  // Mücevher
  { name: 'Diamond Necklace Premium Set', value: 12000, ticketPrice: 35, maxTickets: 350, region: 'africa', categoryId: 3, image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500' },
  { name: 'Gold Watch Collection Luxury', value: 18000, ticketPrice: 45, maxTickets: 420, region: 'middleeast', categoryId: 3, image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=500' },
  { name: 'Pearl Jewelry Set Complete', value: 8500, ticketPrice: 25, maxTickets: 350, region: 'asia', categoryId: 3, image: 'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=500' },
  { name: 'Platinum Ring Collection', value: 15000, ticketPrice: 38, maxTickets: 400, region: 'america', categoryId: 3, image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500' },
  { name: 'Luxury Watch Set Rolex Style', value: 22000, ticketPrice: 55, maxTickets: 420, region: 'russia', categoryId: 3, image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=500' },
  
  // Arsa/Emlak
  { name: '5 Hectare Farm Land Investment', value: 45000, ticketPrice: 65, maxTickets: 720, region: 'africa', categoryId: 6, image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=500' },
  { name: 'Desert Plot Investment Dubai', value: 35000, ticketPrice: 55, maxTickets: 650, region: 'middleeast', categoryId: 6, image: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=500' },
  { name: 'Mountain View Plot Thailand', value: 55000, ticketPrice: 75, maxTickets: 750, region: 'asia', categoryId: 6, image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500' },
  { name: 'Beachfront Land California Style', value: 95000, ticketPrice: 125, maxTickets: 780, region: 'america', categoryId: 6, image: 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=500' },
  { name: 'Forest Investment Land Siberia', value: 42000, ticketPrice: 58, maxTickets: 750, region: 'russia', categoryId: 6, image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=500' }
];

// Bağış kampanyası şablonları
const donationTemplates = [
  { title: 'Clean Water for Village Schools Kenya', goal: 15000, region: 'africa', description: 'Help provide clean drinking water systems for rural schools in Kenya. Every donation helps build sustainable water infrastructure for children education.' },
  { title: 'Emergency Medical Aid Syria Crisis', goal: 25000, region: 'middleeast', description: 'Support medical supplies and emergency care for families affected by the ongoing crisis. Urgent medical assistance and supplies needed for hospitals.' },
  { title: 'Flood Relief Philippines Recovery', goal: 18000, region: 'asia', description: 'Disaster relief for communities affected by recent flooding. Food, shelter, and medical supplies urgently needed for displaced families.' },
  { title: 'Education Fund Brazil Scholarships', goal: 12000, region: 'america', description: 'Scholarship program for underprivileged students in São Paulo. Help provide educational opportunities, books, and school supplies for bright students.' },
  { title: 'Winter Heating for Elderly Russia', goal: 8500, region: 'russia', description: 'Support heating costs for elderly residents during harsh winter months. Every contribution helps keep vulnerable families warm and safe.' },
  { title: 'Orphanage Support Nigeria Lagos', goal: 22000, region: 'africa', description: 'Monthly support for children in Lagos orphanage. Food, clothing, education, and medical care for 50+ children without families.' },
  { title: 'Refugee Aid Lebanon Emergency', goal: 35000, region: 'middleeast', description: 'Essential supplies for refugee families in Lebanon. Help provide food, shelter, and basic necessities for displaced families seeking safety.' },
  { title: 'Earthquake Recovery Nepal Rebuild', goal: 28000, region: 'asia', description: 'Rebuild homes and schools damaged by recent earthquakes. Community reconstruction and emergency supplies needed for affected villages.' },
  { title: 'Food Bank Brazil Hunger Relief', goal: 16000, region: 'america', description: 'Support food distribution for families in need across Brazil. Help combat hunger and malnutrition in underserved communities.' },
  { title: 'Medical Equipment Hospital Russia', goal: 32000, region: 'russia', description: 'Purchase critical medical equipment for regional hospital. Life-saving equipment needed for emergency care and surgery operations.' }
];

// Kısıtlı ülkeler (Türkiye ve bazı diğer ülkeler)
const restrictedCountries = ['TR', 'IR', 'SY', 'AF', 'KP', 'CU', 'VE'];

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
  return Math.floor(Math.random() * 70) + 15; // 15% - 85%
}

function getRandomDonationProgress() {
  return Math.floor(Math.random() * 70) + 5; // 5% - 75%
}

async function createManualRaffle(raffleData) {
  const response = await fetch(`${baseURL}/api/raffles/create-manual`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: raffleData.title,
      description: raffleData.description,
      prizeValue: raffleData.prizeValue,
      ticketPrice: raffleData.ticketPrice,
      maxTickets: raffleData.maxTickets,
      categoryId: raffleData.categoryId,
      endDate: raffleData.endDate,
      isManual: true,
      createdByAdmin: true,
      countryRestriction: 'exclude',
      allowedCountries: JSON.stringify([]),
      excludedCountries: JSON.stringify(restrictedCountries)
    })
  });
  
  return response.json();
}

async function createManualDonation(donationData) {
  const response = await fetch(`${baseURL}/api/donations/create-manual`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: donationData.title,
      description: donationData.description,
      goalAmount: donationData.goalAmount,
      isUnlimited: donationData.isUnlimited,
      endDate: donationData.endDate,
      countryRestriction: 'exclude',
      allowedCountries: JSON.stringify([]),
      excludedCountries: JSON.stringify(restrictedCountries)
    })
  });
  
  return response.json();
}

async function populateHistoricalData() {
  console.log('Başlıyor: Gerçekçi çekiliş ve bağış kampanyaları oluşturma...');
  
  const now = new Date();
  const eightMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 8, 1);
  const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
  
  let createdRaffles = 0;
  let createdDonations = 0;
  
  // 110 çekiliş oluştur
  console.log('Çekilişler oluşturuluyor...');
  for (let i = 0; i < 110; i++) {
    try {
      const template = getRandomElement(raffleTemplates);
      const createdDate = getRandomDate(eightMonthsAgo, threeMonthsAgo);
      const endDate = new Date(createdDate.getTime() + (Math.random() * 30 + 7) * 24 * 60 * 60 * 1000);
      
      const raffleData = {
        title: template.name,
        description: `Exclusive opportunity to win ${template.name}. This premium prize comes with full documentation and warranty. Limited tickets available - join now for your chance to win this amazing prize!`,
        prizeValue: template.value,
        ticketPrice: template.ticketPrice,
        maxTickets: template.maxTickets,
        categoryId: template.categoryId,
        endDate: endDate.toISOString()
      };
      
      const result = await createManualRaffle(raffleData);
      if (result.id) {
        createdRaffles++;
        console.log(`Çekiliş ${createdRaffles}/110: ${template.name}`);
      }
      
      // Rate limiting için kısa bekleme
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`Çekiliş oluşturma hatası ${i}:`, error.message);
    }
  }
  
  // 70 bağış kampanyası oluştur
  console.log('Bağış kampanyaları oluşturuluyor...');
  for (let i = 0; i < 70; i++) {
    try {
      const template = getRandomElement(donationTemplates);
      const createdDate = getRandomDate(eightMonthsAgo, threeMonthsAgo);
      const isUnlimited = Math.random() > 0.7;
      const endDate = isUnlimited ? null : new Date(createdDate.getTime() + (Math.random() * 60 + 30) * 24 * 60 * 60 * 1000);
      
      const donationData = {
        title: template.title,
        description: template.description + ' Your contribution makes a real difference in people\'s lives. Every donation is tracked transparently and goes directly to those in need.',
        goalAmount: template.goal,
        isUnlimited: isUnlimited,
        endDate: endDate ? endDate.toISOString() : null
      };
      
      const result = await createManualDonation(donationData);
      if (result.id) {
        createdDonations++;
        console.log(`Bağış ${createdDonations}/70: ${template.title}`);
      }
      
      // Rate limiting için kısa bekleme
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`Bağış oluşturma hatası ${i}:`, error.message);
    }
  }
  
  console.log(`\nTamamlandı! ${createdRaffles} çekiliş ve ${createdDonations} bağış kampanyası oluşturuldu.`);
  console.log('Toplam:', createdRaffles + createdDonations, 'içerik oluşturuldu.');
}

// Çalıştır
populateHistoricalData().catch(console.error);