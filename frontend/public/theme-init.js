// Runs before React mounts so the saved accent and scanlines show on the first paint (GNR-41).
// A separate file, not an inline script, because the CSP forbids inline scripts.
// Keys and accent names must match src/shared/config/theme.js (a test checks it).
(function () {
  try {
    var d = document.documentElement;
    var accent = localStorage.getItem('gnrdigital:accent');
    if (accent && /^(pink|cyan|amber|green)$/.test(accent) && accent !== 'pink') d.dataset.accent = accent;
    if (localStorage.getItem('gnrdigital:scanlines') === '1') d.dataset.scanlines = 'on';
  } catch (e) { /* storage blocked: defaults apply */ }
})();
