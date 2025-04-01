
const express = require('express');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 3000;


const HUBSPOT_PORTAL_ID = '242419580';  
const HUBSPOT_FORM_ID = '7b106872-95da-452a-bca3-dbb54634e562'; 

app.get('/register', async (req, res) => {
  try {
    const email = req.query.email;
    
    if (!email) {
      return res.status(400).send('Email parameter is required');
    }
    
    // Submit to HubSpot forms API
    const hubspotResponse = await axios.post(
      `https://api.hsforms.com/submissions/v3/integration/submit/${HUBSPOT_PORTAL_ID}/${HUBSPOT_FORM_ID}`,
      {
        fields: [
          {
            name: "email",
            value: email
          }
          // Add more fields as needed
        ],
        context: {
          pageUri: "https://your-website.com/register",
          pageName: "Auto Registration"
        }
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (hubspotResponse.status === 200) {
      // Option 1: Redirect to a thank you page
      return res.redirect('https://your-website.com/thank-you');
      
      // Option 2: Return a simple success message
      // return res.send('You have been successfully registered!');
      
      // Option 3: Redirect to Google or another site
      // return res.redirect('https://google.com');
    } else {
      throw new Error('HubSpot submission failed');
    }
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).send('Registration failed. Please try again later.');
  }
});

app.listen(port, () => {
  console.log(`Auto-registration server running on port ${port}`);
});