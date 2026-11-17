# HIRS × HiresGulf × Tawdheef: Event Registration Kiosk

**To go live on Vercel, follow `GO-LIVE.txt`** (about 3 minutes; no backend needed). Registrations are emailed to the address in
`config.js` (`EMAIL_TO`) with the CV attached, via FormSubmit (free, files up to 10 MB).
The Google Sheet backend below is optional: set `ENDPOINT` and it is used instead,.

| File | What it is |
|---|---|
| `kiosk.html` | The iPad screen: QR code with the logos in the middle and a "No phone? Fill it in here" button |
| `index.html` | The form people land on after scanning: name, email, working status, phone (optional), CV (optional) |
| `config.js` | **The only file you edit**: email address, event name, optional Sheet backend |
| `vercel.json` | Vercel config (`/kiosk` shortcut) |
| `thanks.html` | Used to confirm each email submission went through |
| `apps-script/Code.gs` | Backend: saves rows to a Google Sheet and CVs to Google Drive |
| `assets/` | Logos and the vendored QR library (no CDN needed) |

Without an `ENDPOINT` in `config.js`, both pages run in **DEMO MODE**: everything animates, nothing is saved.

---

## 1. OPTIONAL: Google Sheet backend instead of email (about 5 min)

1. Create a new Google Sheet (e.g. "Event Registrations") on the account that should own the data.
2. **Extensions → Apps Script**. Delete the sample code and paste in `apps-script/Code.gs`. Save.
3. In the function dropdown pick **`setup`** → **Run** → approve the permissions. This creates the `Registrations` tab and the Drive folder `Event CVs - HIRS x HiresGulf x Tawdeef`.
4. **Deploy → New deployment → ⚙ → Web app**
   - Execute as: **Me**
   - Who has access: **Anyone** (attendees don't need a Google login)
5. Copy the **Web app URL** (`https://script.google.com/macros/s/…/exec`) into `ENDPOINT` in `config.js`.

> If you change `Code.gs` later: **Deploy → Manage deployments → Edit → Version: New version**. The URL stays the same.

## 2. Host the pages, about 2 min

Recommended: **Vercel** (see `GO-LIVE.txt`). Other options:

- **Your server:** upload the folder to something like `hiresgulf.com/join/`. A branded URL gets more scans, and the QR stays less dense.
- **Netlify Drop:** go to https://app.netlify.com/drop and drag the `hirs-event` folder in. You get a live `https://….netlify.app` URL instantly. Delete the site after the event.
- Vercel, Cloudflare Pages and S3 all work too. It's plain static HTML.

The QR automatically points to `index.html` on the same site. To point it somewhere else, set `FORM_URL` in `config.js`.

## 3. Logos

Drop these into `assets/` (transparent PNGs, roughly 300px tall or more):

- `logo-hirs.png` (already included, taken from the brand sheet)
- `logo-hiresgulf.png` (included)
- `logo-tawdeef.png` (included: Zaheb × Tawdheef, recoloured dark for the light background)
- `qr-center.png`: the square badge in the middle of the QR (included). Replace it with a square PNG to change it, keeping it simple and high-contrast.

Missing logos fall back to text wordmarks automatically.

## 4. iPad setup

1. Open `https://<your-site>/kiosk.html` in Safari → **Share → Add to Home Screen** → launch it from the icon (it opens full-screen, with no browser bars).
2. **Settings → Display & Brightness → Auto-Lock → Never**.
3. **Settings → Accessibility → Guided Access → On**. Open the kiosk, then triple-click the top/side button to lock the iPad to it.
4. The page keeps the screen awake, refreshes itself every 30 min, and the on-iPad form returns to the QR screen after success or 90 s idle.
5. **Staff panel:** press and hold the white footer bar for 2 s to get Reload / Full screen / Open form / connection status.

The layout is drawn on a fixed design canvas (1024 wide upright, 1366 wide sideways) and scaled to the screen, so it looks the same on iPad mini, iPad, Air, Pro 11" and Pro 13". Pinch-zoom, double-tap zoom, scrolling and long-press menus are disabled. Fonts, logos and the QR library are all bundled locally, so the QR screen still shows if event Wi-Fi drops.

## 5. Before the event

- Scan from one iPhone **and** one Android phone. Submit once with a CV and check the Sheet row and Drive file.

## Data captured (Sheet columns)

Timestamp · Full name · Email · Currently working · Phone · CV link · Source (`qr` / `ipad`) · Event

CVs: PDF, DOC, DOCX, JPG, PNG, up to 8 MB (`MAX_FILE_MB`). A hidden honeypot field filters basic bots.
