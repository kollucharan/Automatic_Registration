
const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();

require('dotenv').config();

const HUBSPOT_PORTAL_ID = process.env.HUBSPOT_PORTAL_ID;
const HUBSPOT_FORM_ID = process.env.HUBSPOT_FORM_ID;
const HUBSPOT_ACCESS_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;
const port = process.env.PORT || 3000;




async function emailHasSubmittedForm(email) {
  let allSubmissions = [];
  let after = null; 

  try {
   
    while (true) {
      const response = await axios.get(
        `https://api.hubapi.com/form-integrations/v1/submissions/forms/${HUBSPOT_FORM_ID}`,
        {
          params: {
            limit: 50,  // Fetch 50 submissions per request
            after: after, // Use the cursor for pagination (will be null for the first request)
          },
          headers: {
            'Authorization': `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const submissions = response.data.results || [];
      allSubmissions = allSubmissions.concat(submissions);

     
      if (response.data.paging && response.data.paging.next) {
        after = response.data.paging.next.after;
      } else {
        break;
      }
    }

    
    for (const submission of allSubmissions) {
      console.log('Checking submission values:', submission.values);
      const emailField = submission.values.find(field =>
        field.name.toLowerCase() === 'email'
      );
      
      if (emailField && emailField.value.toLowerCase() === email.toLowerCase()) {
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error checking form submissions:', error.message);
    throw new Error('Error checking form submissions');
  }
}


app.get('/register', async (req, res) => {
  try {
    const email = req.query.email;
    
    if (!email) {
      return res.status(400).send('Email parameter is required');
    }
    
  
    const hasSubmitted = await emailHasSubmittedForm(email);
    
    if (hasSubmitted) {
      
    return  res.sendFile(path.join(__dirname, 'alreadyregistered.html'));
    }
    
   
    const hubspotResponse = await axios.post(
      `https://api.hsforms.com/submissions/v3/integration/submit/${HUBSPOT_PORTAL_ID}/${HUBSPOT_FORM_ID}`,
      {
        fields: [
          {
            name: "Email",
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
    console.log('Registration error:', error.message);
  
 return  res.sendFile(path.join(__dirname, 'index.html'));
  }
});

app.listen(port, () => {
  console.log(`Auto-registration server running on port ${port}`);
});
