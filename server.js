
// const express = require('express');
// const axios = require('axios');
// const path = require('path');
// const app = express();

// require('dotenv').config();

// const HUBSPOT_PORTAL_ID = process.env.HUBSPOT_PORTAL_ID;
// const HUBSPOT_FORM_ID = process.env.HUBSPOT_FORM_ID;
// // const HUBSPOT_ACCESS_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;
// const port = process.env.PORT || 3000;

// app.get('/register', async (req, res) => {
//   try {
//     const email = req.query.email;
    
//     if (!email) {
//       return res.status(400).send('Email parameter is required');
//     }
    
//     const hubspotResponse = await axios.post(
//       `https://api.hsforms.com/submissions/v3/integration/submit/${HUBSPOT_PORTAL_ID}/${HUBSPOT_FORM_ID}`,
//       {
//         fields: [
//           {
//             name: "email",
//             value: email
//           }
         
//         ],
//         context: {
//           pageUri: "https://www.talview.com/en/thank-you",
//           pageName: "Auto Registration"
//         }
//       },
//       {
//         headers: {
//           'Content-Type': 'application/json'
//         }
//       }
//     );
    
//     if (hubspotResponse.status === 200) {
     
//       return res.redirect('https://www.talview.com/en/thank-you');
      
      
//     } else {
//       throw new Error('HubSpot submission failed');
//     }
    
//   } catch (error) {
//     console.error('Registration error:', error);
  
//    res.sendFile(path.join(__dirname, 'index.html'));
//   }
// });

// app.listen(port, () => {
//   console.log(`Auto-registration server running on port ${port}`);
// });

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
  try {
  
    const response = await axios.get(
      `https://api.hubapi.com/form-integrations/v1/submissions/forms/${HUBSPOT_FORM_ID}`,
      {
        params: {
          limit: 100, 
        },
        headers: {
          'Authorization': `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

  
    const submissions = response.data.results || [];
    
    return submissions.some(submission => {
      const emailField = submission.values.find(field => field.name === 'Email');
      return emailField && emailField.value.toLowerCase() === email.toLowerCase();
    });
  } catch (error) {
    console.error('Error checking form submissions:', error.message);
   
    return false;
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
  
 return  res.sendFile(path.join(__dirname, 'index.html'));
  }
});

app.listen(port, () => {
  console.log(`Auto-registration server running on port ${port}`);
});
