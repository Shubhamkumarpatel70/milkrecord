const axios = require('axios');

async function testLogin() {
  try {
    console.log('Testing Login Functionality...\n');
    
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
    
    // Test regular user login
    console.log('\n--- Testing Regular User Login ---');
    const regularUserData = {
      mobile: '1234567890',
      mpin: '12345'
    };
    
    console.log('Attempting login with:');
    console.log('Mobile:', regularUserData.mobile);
    console.log('MPIN:', regularUserData.mpin);
    console.log('');
    
    const regularResponse = await axios.post('http://localhost:5000/api/auth/login', regularUserData);
    
    console.log('✅ Regular user login successful!');
    console.log('User Role:', regularResponse.data.userRole);
    console.log('User ID:', regularResponse.data.userId);
    console.log('User Name:', regularResponse.data.userName);
    
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

testLogin(); 