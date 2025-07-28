const axios = require('axios');

async function testSubmission() {
  try {
    const response = await axios.post('http://localhost:3001/api/submissions', {
      problemId: '688770f6594389b6e566d02f',
      code: 'print("Hello World")',
      language: 'python'
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer mock-jwt-token-for-testing'
      }
    });
    
    console.log('Success:', response.data);
  } catch (error) {
    console.log('Error Status:', error.response?.status);
    console.log('Error Data:', error.response?.data);
    console.log('Error Message:', error.message);
  }
}

testSubmission(); 