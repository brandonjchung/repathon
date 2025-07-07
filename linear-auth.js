const http = require('http');
const url = require('url');
const https = require('https');
const querystring = require('querystring');
require('dotenv').config();

const CLIENT_ID = process.env.LINEAR_CLIENT_ID;
const CLIENT_SECRET = process.env.LINEAR_CLIENT_SECRET;
const REDIRECT_URI = 'http://localhost:3001/auth/callback';

// Create a simple HTTP server
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  
  if (parsedUrl.pathname === '/') {
    // Step 1: Redirect to Linear OAuth
    const authUrl = `https://linear.app/oauth/authorize?` +
      `client_id=${CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
      `response_type=code&` +
      `scope=read,write`;
    
    res.writeHead(302, { 'Location': authUrl });
    res.end();
  } else if (parsedUrl.pathname === '/auth/callback') {
    // Step 2: Handle the callback with authorization code
    const code = parsedUrl.query.code;
    
    if (!code) {
      res.writeHead(400);
      res.end('No authorization code received');
      return;
    }
    
    // Exchange code for token
    const data = querystring.stringify({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      code: code,
      redirect_uri: REDIRECT_URI,
      grant_type: 'authorization_code'
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
    
    const tokenReq = https.request(options, (tokenRes) => {
      let responseData = '';
      
      tokenRes.on('data', (chunk) => {
        responseData += chunk;
      });
      
      tokenRes.on('end', () => {
        try {
          const response = JSON.parse(responseData);
          if (response.access_token) {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(`
              <html>
                <body>
                  <h1>Success!</h1>
                  <p>Your Linear API token is:</p>
                  <code style="background: #f0f0f0; padding: 10px; display: block; margin: 10px 0;">
                    ${response.access_token}
                  </code>
                  <p>Copy this token and update your .claude.json file.</p>
                  <p>You can close this window and stop the server (Ctrl+C).</p>
                </body>
              </html>
            `);
            console.log('\n✅ Success! Your Linear API token is:');
            console.log(response.access_token);
            console.log('\nNow update your .claude.json file with this token.');
          } else {
            res.writeHead(500);
            res.end('Error getting token: ' + JSON.stringify(response));
            console.log('Error:', response);
          }
        } catch (error) {
          res.writeHead(500);
          res.end('Error parsing response');
          console.log('Error parsing response:', error);
        }
      });
    });
    
    tokenReq.on('error', (error) => {
      res.writeHead(500);
      res.end('Request error');
      console.error('Request error:', error);
    });
    
    tokenReq.write(data);
    tokenReq.end();
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(3001, () => {
  console.log('🚀 Linear OAuth server started on http://localhost:3001');
  console.log('👉 Open http://localhost:3001 in your browser to authenticate');
  console.log('⏹️  Press Ctrl+C to stop the server');
});