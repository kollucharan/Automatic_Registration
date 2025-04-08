
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
      range: `${SHEET_NAME}!A:A` // Only checking column A for email
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

async function addRow(email, fname, lname, campaign) {
  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:D`, // Appending to columns A to D
      valueInputOption: 'RAW',
      resource: {
        values: [[email, fname || '', lname || '', campaign || '']]
      }
    });
  } catch (error) {
    console.error('Error writing to Google Sheets:', error.message);
    throw new Error('Error adding data to Google Sheets');
  }
}

app.get('/register', async (req, res) => {
  try {
    const { email, fname, lname, campaign } = req.query;

    if (!email) {
      return res.status(400).sendFile(path.join(__dirname, 'index.html'));
    }

    const exists = await emailExists(email);
    if (exists) {
        return res.redirect('https://www.talview.com/en/thank-you');
    }

    await addRow(email, fname, lname, campaign);

    return res.redirect('https://www.talview.com/en/thank-you');
  } catch (error) {
    console.log('Registration error:', error.message);
    return res.sendFile(path.join(__dirname, 'index.html'));
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
