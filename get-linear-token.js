const https = require('https');
const querystring = require('querystring');
require('dotenv').config();

// Linear OAuth token endpoint
const tokenUrl = 'https://api.linear.app/oauth/token';

const data = querystring.stringify({
  client_id: process.env.LINEAR_CLIENT_ID,
  client_secret: process.env.LINEAR_CLIENT_SECRET,
  grant_type: 'client_credentials'
});

const options = {
  hostname: 'api.linear.app',
  path: '/oauth/token',
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Content-Length': data.length
  }
};

const req = https.request(options, (res) => {
  let responseData = '';
  
  res.on('data', (chunk) => {
    responseData += chunk;
  });
  
  res.on('end', () => {
    try {
      const response = JSON.parse(responseData);
      if (response.access_token) {
        console.log('Success! Your Linear API token is:');
        console.log(response.access_token);
        console.log('\nNow update your .claude.json file with this token.');
      } else {
        console.log('Error:', response);
      }
    } catch (error) {
      console.log('Error parsing response:', error);
      console.log('Raw response:', responseData);
    }
  });
});

req.on('error', (error) => {
  console.error('Request error:', error);
});

req.write(data);
req.end();