// ─────────────────────────────────────────────────────────────
//  EVENT CONFIG — the only file you need to edit
// ─────────────────────────────────────────────────────────────
window.EVENT_CONFIG = {
  // Public URL of the form page (index.html) once deployed.
  // This is what the QR code on the iPad points to.
  // Leave empty to use "<this site>/index.html" automatically.
  FORM_URL: "",

  // Where registrations go. Each one is emailed here with the CV attached.
  // The first submission sends an "Activate" email to this inbox: click it once.
  EMAIL_TO: "zainfarrukh01@gmail.com",

  // Backup inbox: used automatically when EMAIL_TO is rate-limited by FormSubmit.
  // (needs its own one-time FormSubmit activation click)
  BACKUP_EMAIL_TO: "horizon.itdep@gmail.com",

  // OPTIONAL: Google Apps Script URL (see README). If set, this is used
  // instead of email: rows go to a Google Sheet and CVs to Google Drive.
  ENDPOINT: "",

  // Shown on the kiosk + saved with every submission
  EVENT_NAME: "Career Fair 2026",

  // Max resume size in MB
  MAX_FILE_MB: 8,

};
