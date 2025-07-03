import express from 'express';
import axios from 'axios';
const router = express.Router();

const CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;
const CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET;
const REDIRECT_URI = process.env.LINKEDIN_REDIRECT_URI || 'http://localhost:4000/api/v1/linkedin/callback';

// Step 1: Redirect to LinkedIn OAuth
router.get('/auth', (req, res) => {
  if (!CLIENT_ID) return res.status(500).send('LinkedIn Client ID is not set.');
  if (!CLIENT_SECRET) return res.status(500).send('LinkedIn Client Secret is not set.');
  const scope = 'r_liteprofile r_emailaddress';
  const state = 'xyz123';
  const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&state=${state}&scope=${scope}`;
  res.redirect(authUrl);
});

// Step 2: LinkedIn callback and token exchange
router.get('/callback', async (req, res) => {
  const code = req.query.code;
  const state = req.query.state;
  if (!code) return res.status(400).send('No code provided');
  try {
    // Exchange code for access token
    const tokenRes = await axios.post('https://www.linkedin.com/oauth/v2/accessToken', null, {
      params: {
        grant_type: 'authorization_code',
        code,
        redirect_uri: REDIRECT_URI,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
      },
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    const accessToken = tokenRes.data.access_token;

    // Fetch profile
    const profileRes = await axios.get('https://api.linkedin.com/v2/me', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    // Fetch email
    const emailRes = await axios.get('https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    // Show data as JSON (for demo)
    res.json({
      profile: profileRes.data,
      email: emailRes.data.elements[0]['handle~'].emailAddress
    });
  } catch (err) {
    res.status(500).json({ error: 'LinkedIn import failed', details: err.message });
  }
});

// Test route to verify router is loaded
router.get('/test', (req, res) => {
  res.send('LinkedIn router is working!');
});

export default router;
