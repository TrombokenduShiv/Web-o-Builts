/**
 * Google Apps Script to synchronize Google Sheets updates back to the Django Backend.
 * 
 * 1. Open your Google Sheet.
 * 2. Go to Extensions > Apps Script.
 * 3. Paste this code and save.
 * 4. Replace WEBHOOK_URL with your actual production backend URL.
 * 5. Add an OnEdit trigger: Triggers (clock icon) > Add Trigger > 
 *    Run onEditSync > From spreadsheet > On edit.
 */

const WEBHOOK_URL = 'https://your-production-url.com/api/dashboard/webhooks/google-sheet-sync/';

function onEditSync(e) {
  if (!e || !e.range) return;
  
  const sheet = e.source.getActiveSheet();
  const sheetName = sheet.getName();
  
  // We only care about specific sheets
  if (sheetName !== 'CallBookings' && sheetName !== 'Payments') return;
  
  const row = e.range.getRow();
  if (row === 1) return; // Ignore header row edits
  
  // Assuming ID is in column A (index 1)
  const id = sheet.getRange(row, 1).getValue();
  if (!id) return;
  
  // Get headers
  const lastCol = sheet.getLastColumn();
  const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  
  // Get the edited column name and value
  const col = e.range.getColumn();
  const editedField = headers[col - 1];
  const newValue = e.value;
  
  // Only sync if the edited field maps to something we care about (e.g. status)
  const allowedFields = ['status'];
  if (!allowedFields.includes(editedField.toLowerCase())) return;
  
  const payload = {
    sheet: sheetName,
    id: id,
    updates: {
      [editedField.toLowerCase()]: newValue
    }
  };
  
  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload)
  };
  
  try {
    UrlFetchApp.fetch(WEBHOOK_URL, options);
  } catch (err) {
    Logger.log('Sync failed: ' + err.toString());
  }
}
