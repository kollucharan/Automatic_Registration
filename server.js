
const express = require('express');
const path = require('path');
require('dotenv').config();

const { google } = require('googleapis');
const app = express();
const port = process.env.PORT || 3000;

const SPREADSHEET_ID = process.env.SPREADSHEET_ID; 
const SHEET_NAME = process.env.SHEET_NAME || 'Sheet1'; 

const auth = new google.auth.GoogleAuth({
  keyFile: './credentials.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});
const sheets = google.sheets({ version: 'v4', auth });


async function emailExists(email) {
  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:A`
    });
    const rows = res.data.values;
    if (rows) {
      for (let i = 0; i < rows.length; i++) {
        if (rows[i][0].toLowerCase() === email.toLowerCase()) {
          return true;
        }
      }
    }
    return false;
  } catch (error) {
    console.error('Error reading from Google Sheets:', error.message);
    throw new Error('Error checking for email in Google Sheets');
  }
}


async function addEmail(email) {
  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:A`,
      valueInputOption: 'RAW',
      resource: {
        values: [[email]]
      }
    });
  } catch (error) {
    console.error('Error writing to Google Sheets:', error.message);
    throw new Error('Error adding email to Google Sheets');
  }
}

app.get('/register', async (req, res) => {
  try {
    const email = req.query.email;
    if (!email) {
      return res.status(400).sendFile(path.join(__dirname, 'index.html'));
    }
    
    
    const exists = await emailExists(email);
    if (exists) {
      return res.sendFile(path.join(__dirname, 'alreadyregistered.html'));
    }
    
   
    await addEmail(email);
    
   
    return res.redirect('https://www.talview.com/en/thank-you');
  } catch (error) {
    console.log('Registration error:', error.message);
    return res.sendFile(path.join(__dirname, 'index.html'));
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
