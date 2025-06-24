import fetch from 'node-fetch';

const baseURL = 'http://localhost:5000';

async function createBulkContent() {
  console.log('Başlıyor: Basit bulk içerik oluşturma...');
  
  let successCount = 0;
  
  // 10 test çekiliş oluştur
  for (let i = 1; i <= 10; i++) {
    try {
      const raffleData = {
        title: `Premium Car ${i} - BMW X5 Series`,
        description: `Exclusive opportunity to win Premium Car ${i}. This luxury vehicle comes with full documentation and warranty. Limited tickets available!`,
        prizeValue: (50000 + i * 5000).toString(),
        ticketPrice: (75 + i * 5).toString(),
        maxTickets: (600 + i * 50).toString(),
        categoryId: "6",
        endDate: new Date(Date.now() + (7 + i) * 24 * 60 * 60 * 1000).toISOString(),
        countryRestriction: 'exclude',
        allowedCountries: '[]',
        excludedCountries: '["TR","IR","SY","AF"]'
      };
      
      const response = await fetch(`${baseURL}/api/raffles/create-manual`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(raffleData)
      });
      
      const result = await response.json();
      
      if (response.ok && result.id) {
        successCount++;
        console.log(`✓ Çekiliş ${i} oluşturuldu: ID ${result.id}`);
      } else {
        console.log(`✗ Çekiliş ${i} hata:`, result.message || JSON.stringify(result));
      }
      
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.log(`✗ Çekiliş ${i} hata:`, error.message);
    }
  }
  
  // 5 test bağış oluştur
  for (let i = 1; i <= 5; i++) {
    try {
      const donationData = {
        title: `Emergency Aid Campaign ${i}`,
        description: `Critical emergency aid needed for affected communities. Your contribution makes a real difference. Campaign ${i} for urgent humanitarian support.`,
        goalAmount: (10000 + i * 5000).toString(),
        isUnlimited: false,
        endDate: new Date(Date.now() + (30 + i * 10) * 24 * 60 * 60 * 1000).toISOString(),
        countryRestriction: 'exclude',
        allowedCountries: '[]',
        excludedCountries: '["TR","IR","SY","AF"]'
      };
      
      const response = await fetch(`${baseURL}/api/donations/create-manual`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(donationData)
      });
      
      const result = await response.json();
      
      if (response.ok && result.id) {
        successCount++;
        console.log(`✓ Bağış ${i} oluşturuldu: ID ${result.id}`);
      } else {
        console.log(`✗ Bağış ${i} hata:`, result.message || JSON.stringify(result));
      }
      
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.log(`✗ Bağış ${i} hata:`, error.message);
    }
  }
  
  console.log(`\nTamamlandı! Toplam ${successCount}/15 içerik başarıyla oluşturuldu.`);
}

createBulkContent().catch(console.error);