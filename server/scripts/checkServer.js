const axios = require('axios');

async function checkServer() {
  try {
    console.log('Checking server status...\n');
    
    // Test basic server response
    const response = await axios.get('http://localhost:5000/api/auth/login', {
      timeout: 5000
    });
    
    console.log('✅ Server is responding!');
    console.log('Status:', response.status);
    console.log('Server is ready for requests');
    
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ Server is not running on port 5000');
      console.log('Please start the server with: npm start');
    } else if (error.code === 'ENOTFOUND') {
      console.log('❌ Cannot connect to localhost:5000');
      console.log('Check if the server is running');
    } else if (error.response) {
      console.log('✅ Server is running but returned status:', error.response.status);
      console.log('This is expected for a GET request to login endpoint');
    } else {
      console.log('❌ Error:', error.message);
    }
  }
}

checkServer(); 