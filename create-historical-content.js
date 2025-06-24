import fetch from 'node-fetch';

const baseURL = 'http://localhost:5000';

// Gerçekçi çekiliş şablonları
const raffleTemplates = [
  // Evler - Afrika
  { name: 'Modern Villa Lagos Nigeria', value: 85000, ticketPrice: 142, maxTickets: 600, region: 'africa', categoryId: 2 },
  { name: 'Seaside Apartment Cape Town', value: 95000, ticketPrice: 158, maxTickets: 600, region: 'africa', categoryId: 2 },
  { name: 'Luxury House Nairobi Kenya', value: 75000, ticketPrice: 125, maxTickets: 600, region: 'africa', categoryId: 2 },
  
  // Evler - Orta Doğu
  { name: 'Luxury Apartment Dubai UAE', value: 120000, ticketPrice: 200, maxTickets: 600, region: 'middleeast', categoryId: 2 },
  { name: 'Modern Penthouse Doha Qatar', value: 135000, ticketPrice: 225, maxTickets: 600, region: 'middleeast', categoryId: 2 },
  { name: 'Beachfront Villa Abu Dhabi', value: 150000, ticketPrice: 250, maxTickets: 600, region: 'middleeast', categoryId: 2 },
  
  // Evler - Asya
  { name: 'Beach House Phuket Thailand', value: 75000, ticketPrice: 125, maxTickets: 600, region: 'asia', categoryId: 2 },
  { name: 'Modern Condo Singapore', value: 140000, ticketPrice: 233, maxTickets: 600, region: 'asia', categoryId: 2 },
  { name: 'Mountain View House Bali', value: 65000, ticketPrice: 108, maxTickets: 600, region: 'asia', categoryId: 2 },
  
  // Evler - Amerika
  { name: 'Modern Condo São Paulo Brazil', value: 95000, ticketPrice: 158, maxTickets: 600, region: 'america', categoryId: 2 },
  { name: 'Beach House Miami Style', value: 180000, ticketPrice: 300, maxTickets: 600, region: 'america', categoryId: 2 },
  { name: 'City Apartment Mexico City', value: 85000, ticketPrice: 142, maxTickets: 600, region: 'america', categoryId: 2 },
  
  // Evler - Rusya
  { name: 'Country House Moscow Region', value: 110000, ticketPrice: 183, maxTickets: 600, region: 'russia', categoryId: 2 },
  { name: 'Luxury Apartment St Petersburg', value: 125000, ticketPrice: 208, maxTickets: 600, region: 'russia', categoryId: 2 },
  
  // Arabalar - Premium
  { name: 'BMW X5 2023 Model', value: 65000, ticketPrice: 87, maxTickets: 750, region: 'africa', categoryId: 6 },
  { name: 'Mercedes-Benz S-Class 2024', value: 85000, ticketPrice: 113, maxTickets: 750, region: 'middleeast', categoryId: 6 },
  { name: 'Audi A8 Luxury Sedan', value: 78000, ticketPrice: 104, maxTickets: 750, region: 'asia', categoryId: 6 },
  { name: 'Tesla Model S Plaid', value: 95000, ticketPrice: 127, maxTickets: 750, region: 'america', categoryId: 6 },
  { name: 'Porsche Cayenne Turbo', value: 105000, ticketPrice: 140, maxTickets: 750, region: 'russia', categoryId: 6 },
  { name: 'Range Rover Sport HSE', value: 92000, ticketPrice: 123, maxTickets: 750, region: 'africa', categoryId: 6 },
  { name: 'Bentley Continental GT', value: 220000, ticketPrice: 293, maxTickets: 750, region: 'middleeast', categoryId: 6 },
  { name: 'Lamborghini Urus', value: 230000, ticketPrice: 307, maxTickets: 750, region: 'asia', categoryId: 6 },
  
  // Elektronik
  { name: 'iPhone 15 Pro Max Complete Set', value: 1500, ticketPrice: 8, maxTickets: 190, region: 'africa', categoryId: 1 },
  { name: 'MacBook Pro M3 Max 16-inch', value: 3500, ticketPrice: 18, maxTickets: 190, region: 'middleeast', categoryId: 1 },
  { name: 'Gaming Setup Complete RTX 4090', value: 2800, ticketPrice: 15, maxTickets: 190, region: 'asia', categoryId: 1 },
  { name: 'Home Theater System Premium', value: 4200, ticketPrice: 22, maxTickets: 190, region: 'america', categoryId: 1 },
  { name: 'Professional Camera Kit Sony', value: 5500, ticketPrice: 29, maxTickets: 190, region: 'russia', categoryId: 1 },
  { name: 'Samsung Galaxy S24 Ultra Bundle', value: 1800, ticketPrice: 9, maxTickets: 190, region: 'africa', categoryId: 1 },
  
  // Mücevher
  { name: 'Diamond Necklace Premium Set', value: 12000, ticketPrice: 32, maxTickets: 375, region: 'africa', categoryId: 3 },
  { name: 'Gold Watch Collection Luxury', value: 18000, ticketPrice: 48, maxTickets: 375, region: 'middleeast', categoryId: 3 },
  { name: 'Pearl Jewelry Set Complete', value: 8500, ticketPrice: 23, maxTickets: 375, region: 'asia', categoryId: 3 },
  { name: 'Platinum Ring Collection', value: 15000, ticketPrice: 40, maxTickets: 375, region: 'america', categoryId: 3 },
  { name: 'Luxury Watch Set Premium', value: 22000, ticketPrice: 59, maxTickets: 375, region: 'russia', categoryId: 3 },
  
  // Arsa/Emlak
  { name: '5 Hectare Farm Land Investment', value: 45000, ticketPrice: 64, maxTickets: 700, region: 'africa', categoryId: 6 },
  { name: 'Desert Plot Investment Dubai', value: 35000, ticketPrice: 50, maxTickets: 700, region: 'middleeast', categoryId: 6 },
  { name: 'Mountain View Plot Thailand', value: 55000, ticketPrice: 79, maxTickets: 700, region: 'asia', categoryId: 6 },
  { name: 'Beachfront Land Investment', value: 95000, ticketPrice: 136, maxTickets: 700, region: 'america', categoryId: 6 },
  { name: 'Forest Investment Land Siberia', value: 42000, ticketPrice: 60, maxTickets: 700, region: 'russia', categoryId: 6 }
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
  { title: 'Medical Equipment Hospital Russia', goal: 32000, region: 'russia', description: 'Purchase critical medical equipment for regional hospital. Life-saving equipment needed for emergency care and surgery operations.' },
  { title: 'School Building Project Ghana', goal: 45000, region: 'africa', description: 'Build new classrooms for overcrowded school in rural Ghana. Education infrastructure needed for 200+ students without proper facilities.' },
  { title: 'Cancer Treatment Support Jordan', goal: 40000, region: 'middleeast', description: 'Help families cover cancer treatment costs. Medical expenses and support for patients undergoing chemotherapy and radiation therapy.' },
  { title: 'Tsunami Recovery Indonesia', goal: 55000, region: 'asia', description: 'Rebuild coastal communities after tsunami damage. Housing reconstruction, boats for fishermen, and community center restoration needed.' },
  { title: 'Homeless Shelter Argentina', goal: 25000, region: 'america', description: 'Support homeless shelter operations in Buenos Aires. Provide meals, beds, and job training programs for people experiencing homelessness.' },
  { title: 'Forest Fire Recovery Siberia', goal: 38000, region: 'russia', description: 'Help communities recover from devastating forest fires. Rebuild homes, restore farmland, and support affected wildlife rehabilitation.' }
];

// Kısıtlı ülkeler
const restrictedCountries = ['TR', 'IR', 'SY', 'AF', 'KP', 'CU', 'VE'];

function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

async function createManualRaffle(raffleData) {
  try {
    const response = await fetch(`${baseURL}/api/raffles/create-manual`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(raffleData)
    });
    
    const result = await response.json();
    return { success: response.ok, data: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function createManualDonation(donationData) {
  try {
    const response = await fetch(`${baseURL}/api/donations/create-manual`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(donationData)
    });
    
    const result = await response.json();
    return { success: response.ok, data: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function populateHistoricalContent() {
  console.log('Başlıyor: 170-180 gerçekçi çekiliş ve bağış kampanyası oluşturma...');
  
  const now = new Date();
  const eightMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 8, 1);
  const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
  
  let successfulRaffles = 0;
  let successfulDonations = 0;
  let totalAttempts = 0;
  
  // 120 çekiliş oluştur
  console.log('Çekilişler oluşturuluyor...');
  for (let i = 0; i < 120; i++) {
    totalAttempts++;
    const template = getRandomElement(raffleTemplates);
    const createdDate = getRandomDate(eightMonthsAgo, threeMonthsAgo);
    const endDate = new Date(createdDate.getTime() + (Math.random() * 30 + 7) * 24 * 60 * 60 * 1000);
    
    const raffleData = {
      title: template.name,
      description: `Exclusive opportunity to win ${template.name}. This premium prize comes with full documentation and warranty. Limited tickets available - join now for your chance to win this amazing prize! International shipping included.`,
      prizeValue: template.value.toString(),
      ticketPrice: template.ticketPrice.toString(),
      maxTickets: template.maxTickets.toString(),
      categoryId: template.categoryId.toString(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      countryRestriction: 'exclude',
      allowedCountries: '[]',
      excludedCountries: JSON.stringify(restrictedCountries)
    };
    
    const result = await createManualRaffle(raffleData);
    if (result.success) {
      successfulRaffles++;
      console.log(`✓ Çekiliş ${successfulRaffles}: ${template.name}`);
    } else {
      console.log(`✗ Hata: ${result.error || JSON.stringify(result.data)}`);
    }
    
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  
  // 60 bağış kampanyası oluştur
  console.log('\nBağış kampanyaları oluşturuluyor...');
  for (let i = 0; i < 60; i++) {
    totalAttempts++;
    const template = getRandomElement(donationTemplates);
    const createdDate = getRandomDate(eightMonthsAgo, threeMonthsAgo);
    const isUnlimited = Math.random() > 0.75; // 25% süresiz
    const endDate = isUnlimited ? null : new Date(createdDate.getTime() + (Math.random() * 60 + 30) * 24 * 60 * 60 * 1000);
    
    const donationData = {
      title: template.title,
      description: template.description + ' Your contribution makes a real difference in people\'s lives. Every donation is tracked transparently and goes directly to those in need. 100% of funds reach beneficiaries.',
      goalAmount: template.goal.toString(),
      isUnlimited: isUnlimited,
      endDate: endDate ? endDate.toISOString() : null,
      countryRestriction: 'exclude',
      allowedCountries: '[]',
      excludedCountries: JSON.stringify(restrictedCountries)
    };
    
    const result = await createManualDonation(donationData);
    if (result.success) {
      successfulDonations++;
      console.log(`✓ Bağış ${successfulDonations}: ${template.title}`);
    } else {
      console.log(`✗ Hata: ${result.error || JSON.stringify(result.data)}`);
    }
    
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  
  console.log('\n=== SONUÇLAR ===');
  console.log(`Başarılı çekilişler: ${successfulRaffles}/120`);
  console.log(`Başarılı bağışlar: ${successfulDonations}/60`);
  console.log(`Toplam başarılı: ${successfulRaffles + successfulDonations}/${totalAttempts}`);
  console.log('\nTüm içerikler Türkiye ve kısıtlı ülkelere kapalı olarak oluşturuldu.');
  console.log('Tarih aralığı: 8 ay önce - 3 ay önce');
}

// Çalıştır
populateHistoricalContent().catch(console.error);