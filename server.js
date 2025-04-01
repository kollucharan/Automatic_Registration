
const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();

require('dotenv').config();

const HUBSPOT_PORTAL_ID = process.env.HUBSPOT_PORTAL_ID;
const HUBSPOT_FORM_ID = process.env.HUBSPOT_FORM_ID;

const port = process.env.PORT || 3000;

// const HUBSPOT_PORTAL_ID = '242419580';  
// const HUBSPOT_FORM_ID = '7b106872-95da-452a-bca3-dbb54634e562'; 

app.get('/register', async (req, res) => {
  try {
    const email = req.query.email;
    
    if (!email) {
      return res.status(400).send('Email parameter is required');
    }
    
    const hubspotResponse = await axios.post(
      `https://api.hsforms.com/submissions/v3/integration/submit/${HUBSPOT_PORTAL_ID}/${HUBSPOT_FORM_ID}`,
      {
        fields: [
          {
            name: "email",
            value: email
          }
         
        ],
        context: {
          pageUri: "https://www.talview.com/en/thank-you",
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
     
      return res.redirect('https://www.talview.com/en/thank-you');
      
      
    } else {
      throw new Error('HubSpot submission failed');
    }
    
  } catch (error) {
    console.error('Registration error:', error);
  
   res.sendFile(path.join(__dirname, 'index.html'));
  }
});

app.listen(port, () => {
  console.log(`Auto-registration server running on port ${port}`);
});