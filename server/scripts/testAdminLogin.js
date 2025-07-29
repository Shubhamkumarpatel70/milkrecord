const axios = require('axios');

async function testAdminLogin() {
  try {
    console.log('Testing Admin Login...\n');
    
    // Test admin login
    const loginData = {
      mobile: '9999999999',
      mpin: '12345'
    };
    
    console.log('Attempting login with:');
    console.log('Mobile:', loginData.mobile);
    console.log('MPIN:', loginData.mpin);
    console.log('');
    
    const response = await axios.post('http://localhost:5000/api/auth/login', loginData);
    
    console.log('✅ Login successful!');
    console.log('Response:', response.data);
    console.log('');
    console.log('User Role:', response.data.userRole);
    console.log('User ID:', response.data.userId);
    console.log('User Name:', response.data.userName);
    
    if (response.data.userRole === 'admin') {
      console.log('✅ User has admin role - will see admin dashboard');
    } else {
      console.log('❌ User does not have admin role');
    }
    
  } catch (error) {
    console.error('❌ Login failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Message:', error.response.data.message);
    } else {
      console.error('Error:', error.message);
    }
  }
}

// Check if server is running
async function checkServer() {
  try {
    await axios.get('http://localhost:5000/api/auth/login');
    console.log('✅ Server is running on port 5000');
    await testAdminLogin();
  } catch (error) {
    console.log('❌ Server is not running on port 5000');
    console.log('Please start the server first with: npm start');
  }
}

checkServer(); 