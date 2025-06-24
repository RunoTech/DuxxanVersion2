import fetch from 'node-fetch';

const baseURL = 'http://localhost:5000';

async function testSingleRaffle() {
  console.log('Testing single raffle creation...');
  
  const testData = {
    title: 'BMW X5 2023 Test',
    description: 'Test raffle for BMW X5 2023 model',
    prizeValue: 65000,
    ticketPrice: 85,
    maxTickets: 780,
    categoryId: 6,
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    isManual: true,
    createdByAdmin: true,
    countryRestriction: 'exclude',
    allowedCountries: '[]',
    excludedCountries: '["TR","IR","SY"]'
  };
  
  try {
    const response = await fetch(`${baseURL}/api/raffles/create-manual`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });
    
    const result = await response.json();
    console.log('Response status:', response.status);
    console.log('Response:', JSON.stringify(result, null, 2));
    
    if (result.id) {
      console.log('SUCCESS: Raffle created with ID:', result.id);
    } else {
      console.log('FAILED: No ID returned');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

testSingleRaffle();