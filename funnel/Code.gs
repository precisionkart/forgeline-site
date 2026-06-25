/**
 * Forgeline — simple self-owned funnel.
 *
 * Receives a lead from the website quote form and appends it as a row to the
 * bound Google Sheet. The sheet IS your funnel board: sort/filter by the
 * "status" column to move leads New → Contacted → Quoted → Won / Lost.
 *
 * Setup: see funnel/README.md
 */

// Order of columns written to the sheet. Add/remove freely — the header row
// is created automatically to match this list on first run.
var FIELDS = [
  'submitted_at',
  'status',
  'name',
  'email',
  'phone',
  'company',
  'process',
  'qty',
  'notes',
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'gclid',
  'fbclid',
  'referrer',
  'page_url'
];

var SHEET_NAME = 'Leads';

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(15000);
  try {
    var data = {};
    if (e && e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    }

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);

    // Ensure a header row exists and matches FIELDS.
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(FIELDS);
      sheet.getRange(1, 1, 1, FIELDS.length).setFontWeight('bold');
      sheet.setFrozenRows(1);
    }

    var row = FIELDS.map(function (key) {
      if (key === 'status') return data.status || 'New';
      if (key === 'submitted_at') return data.submitted_at || new Date().toISOString();
      return data[key] !== undefined && data[key] !== null ? data[key] : '';
    });

    sheet.appendRow(row);

    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

// Lets you open the /exec URL in a browser to confirm it's deployed.
function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, service: 'forgeline-funnel' }))
    .setMimeType(ContentService.MimeType.JSON);
}
