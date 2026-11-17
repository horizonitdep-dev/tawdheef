/**
 * HIRS × HiresGulf × Tawdeef: event registration backend
 * Saves each submission to the Google Sheet this script is attached to,
 * and each CV to a Drive folder.
 *
 * Setup: see README.md ("Backend setup").
 */

const SHEET_NAME  = 'Registrations';
const FOLDER_NAME = 'Event CVs - HIRS x HiresGulf x Tawdeef';
const MAX_BYTES   = 8 * 1024 * 1024;
const HEADERS     = ['Timestamp', 'Full name', 'Email', 'Currently working', 'Area of interest', 'Phone', 'CV link', 'Source', 'Event'];

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(25000);
  try {
    const d = JSON.parse(e.postData.contents || '{}');
    if (d.website) return json({ ok: true });               // bot honeypot

    const name    = clean(d.name, 80);
    const email   = clean(d.email, 120).toLowerCase();
    const working = d.working === 'Yes' ? 'Yes' : d.working === 'No' ? 'No' : '';
    const phone   = clean(d.phone, 30);
    const industry = clean(d.industry, 80);
    if (name.length < 2)                         throw new Error('Name required');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) throw new Error('Valid email required');
    if (!working)                                throw new Error('Working status required');

    let cvLink = '';
    if (d.resume && d.resume.data) {
      const bytes = Utilities.base64Decode(d.resume.data);
      if (bytes.length > MAX_BYTES) throw new Error('File too large');
      const ext  = (String(d.resume.name || '').split('.').pop() || 'pdf').replace(/[^a-z0-9]/gi, '').slice(0, 5);
      const file = folder_().createFile(
        Utilities.newBlob(bytes, d.resume.type || 'application/octet-stream', `${name} - ${email}.${ext}`)
      );
      cvLink = file.getUrl();
    }

    const sh = sheet_();
    sh.appendRow([new Date(), name, email, working, industry, phone ? "'" + phone : '', cvLink, clean(d.source, 20), clean(d.event, 80)]);
    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: String(err.message || err) });
  } finally {
    lock.releaseLock();
  }
}

// ── helpers ──
function sheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.appendRow(HEADERS);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold').setBackground('#FC7224').setFontColor('#ffffff');
    sh.setColumnWidths(1, HEADERS.length, 180);
  }
  return sh;
}
function folder_() {
  const it = DriveApp.getFoldersByName(FOLDER_NAME);
  return it.hasNext() ? it.next() : DriveApp.createFolder(FOLDER_NAME);
}
function clean(v, max) { return String(v == null ? '' : v).replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, max); }
function json(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

// Run once from the editor to authorise Drive + Sheets access
function setup() { sheet_(); folder_(); }
