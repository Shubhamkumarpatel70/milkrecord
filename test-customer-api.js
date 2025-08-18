const axios = require('axios');

// Configure axios base URL
axios.defaults.baseURL = 'http://localhost:5000';

async function testCustomerAPI() {
    console.log('🧪 Testing Customer API Endpoints...\n');

    // Test 1: Get customer by ID
    console.log('1. Testing GET /api/customers/:id');
    try {
        const response = await axios.get('/api/customers/68847891958badf20c451185');
        console.log('✅ Success:', response.data);
    } catch (error) {
        console.log('❌ Error:', error.response?.data || error.message);
    }
    console.log('');

    // Test 2: Verify customer access
    console.log('2. Testing POST /api/customers/:id/verify');
    try {
        const response = await axios.post('/api/customers/68847891958badf20c451185/verify', {
            whatsapp: '9876543210' // Replace with actual WhatsApp number
        });
        console.log('✅ Success:', response.data);
    } catch (error) {
        console.log('❌ Error:', error.response?.data || error.message);
    }
    console.log('');

    // Test 3: Get customer records
    console.log('3. Testing GET /api/customers/:id/records');
    try {
        const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
        const response = await axios.get(`/api/customers/68847891958badf20c451185/records?month=${currentMonth}`);
        console.log('✅ Success:', {
            customer: response.data.customer,
            summary: response.data.summary,
            daysCount: response.data.days?.length || 0
        });
    } catch (error) {
        console.log('❌ Error:', error.response?.data || error.message);
    }
    console.log('');

    // Test 4: Get all customers (requires userId)
    console.log('4. Testing GET /api/customers (requires userId)');
    try {
        const response = await axios.get('/api/customers?userId=test-user-id');
        console.log('✅ Success:', response.data);
    } catch (error) {
        console.log('❌ Error:', error.response?.data || error.message);
    }
    console.log('');

    console.log('🎯 API Testing Complete!');
}

// Run the tests
testCustomerAPI().catch(console.error);
