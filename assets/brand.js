// Shared brand helpers: logo fallbacks + QR center badge
(function () {
  // Any <img data-wm> that fails to load becomes a text wordmark.
  window.logoFallback = function (img) {
    const s = document.createElement("span");
    s.className = "wm wm-" + (img.dataset.wm || "");
    s.textContent = img.alt;
    img.replaceWith(s);
  };

  // Placeholder badge for the middle of the QR (used until assets/qr-center.png exists)
  window.qrCenterPlaceholder = function () {
    const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#FC7224"/><stop offset="1" stop-color="#FEB46B"/>
    </linearGradient>
  </defs>
  <rect x="6" y="6" width="288" height="288" rx="64" fill="#fff"/>
  <rect x="22" y="22" width="256" height="256" rx="52" fill="url(#g)"/>
  <text x="150" y="118" text-anchor="middle" font-family="Arial Black,Arial,sans-serif" font-weight="900" font-size="64" fill="#fff" letter-spacing="2">HIRS</text>
  <text x="150" y="170" text-anchor="middle" font-family="Arial,sans-serif" font-weight="700" font-size="34" fill="#351601">HiresGulf</text>
  <text x="150" y="220" text-anchor="middle" font-family="Arial,sans-serif" font-weight="700" font-size="34" fill="#fff">Tawdeef</text>
</svg>`;
    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  };

  // Resolve the QR center image: real file if present, else placeholder
  window.resolveQrCenter = function () {
    return new Promise((res) => {
      const i = new Image();
      i.onload = () => res("assets/qr-center.png");
      i.onerror = () => res(window.qrCenterPlaceholder());
      i.src = "assets/qr-center.png?v=" + Date.now();
    });
  };

  // Form URL the QR points to
  window.formUrl = function () {
    const c = window.EVENT_CONFIG || {};
    if (c.FORM_URL) return c.FORM_URL;
    return new URL("index.html", location.href).href.replace(/index\.html$/, "");
  };
})();
