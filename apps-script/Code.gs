/**
 * HIRS x HiresGulf x Tawdheef: event registration backend (Google Apps Script)
 * Saves each registration as a row in this Google Sheet and each CV as a file
 * in Google Drive (link in the row). Deployed as a Web App: Execute as Me, Anyone.
 */

const SHEET_NAME  = 'Registrations';
const FOLDER_NAME = 'Event CVs - HIRS x HiresGulf x Tawdheef';
const MAX_BYTES   = 10 * 1024 * 1024;
const HEADERS     = ['Timestamp', 'Full name', 'Email', 'Currently working', 'Area of interest', 'Phone', 'CV', 'CV file name', 'Source', 'Event'];

function doPost(e) {
  try {
    const d = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (d.website) return json({ ok: true });                       // bot honeypot

    const name     = clean(d.name, 80);
    const email    = clean(d.email, 120).toLowerCase();
    const working  = d.working === 'Yes' ? 'Yes' : d.working === 'No' ? 'No' : '';
    const industry = clean(d.industry, 80);
    const phone    = clean(d.phone, 30);
    if (name.length < 2) throw new Error('Name required');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) throw new Error('Valid email required');
    if (!working) throw new Error('Working status required');

    // Save the CV first (outside the lock, so uploads don't queue behind each other)
    let cvUrl = '', cvName = '';
    if (d.resume && d.resume.data) {
      const bytes = Utilities.base64Decode(d.resume.data);
      if (bytes.length > MAX_BYTES) throw new Error('File too large');
      const ext = (String(d.resume.name || '').split('.').pop() || 'pdf').replace(/[^a-z0-9]/gi, '').slice(0, 5) || 'pdf';
      cvName = clean(d.resume.name, 120);
      const file = folder_().createFile(Utilities.newBlob(bytes, d.resume.type || 'application/octet-stream', name + ' - ' + email + '.' + ext));
      cvUrl = file.getUrl();
    }

    const lock = LockService.getScriptLock();
    lock.waitLock(30000);
    try {
      sheet_().appendRow([
        new Date(), name, email, working, industry,
        phone ? "'" + phone : '',
        cvUrl ? '=HYPERLINK("' + cvUrl + '","Open CV")' : '',
        cvName, clean(d.source, 20), clean(d.event, 80)
      ]);
    } finally {
      lock.releaseLock();
    }
    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: String(err.message || err) });
  }
}

// Health check: open the Web App URL in a browser → {"ok":true,"service":"registrations"}
function doGet() { return json({ ok: true, service: 'registrations' }); }

function sheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME, 0);
    sh.appendRow(HEADERS);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold').setBackground('#FC7224').setFontColor('#ffffff');
    sh.setColumnWidth(1, 160); sh.setColumnWidths(2, HEADERS.length - 1, 190);
  }
  return sh;
}
function folder_() {
  const it = DriveApp.getFoldersByName(FOLDER_NAME);
  return it.hasNext() ? it.next() : DriveApp.createFolder(FOLDER_NAME);
}
function clean(v, max) { return String(v == null ? '' : v).replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, max); }
function json(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

// Run once from the editor to create the sheet + folder and grant permissions
function setup() { sheet_(); folder_(); }
