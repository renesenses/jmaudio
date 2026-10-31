/* ============================================
   JM Audio — Sécurité partagée
   Chargé en premier sur chaque page (dans <head>).
   - refus d'affichage dans un cadre tiers
     (frame-ancestors n'est pas pris en compte dans une CSP en <meta>) ;
   - échappement HTML et validation des URL, utilisés par main.js,
     produit.js et admin.js pour tout contenu venant de data.json.
   ============================================ */

(function () {
  'use strict';

  /* --- Anti-cadre --- */
  if (window.self !== window.top) {
    document.documentElement.style.display = 'none';
    try {
      window.top.location.replace(window.self.location.href);
    } catch (e) { /* cadre d'une autre origine : la page reste masquée */ }
  }

  /* --- Échappement HTML (texte et valeurs d'attributs) --- */
  var ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

  function esc(value) {
    if (value === null || value === undefined) return '';
    return String(value).replace(/[&<>"']/g, function (c) { return ESC[c]; });
  }

  /* Texte multiligne : échappé, puis retours à la ligne en <br>. */
  function escLines(value) {
    return esc(value).replace(/\r?\n/g, '<br>');
  }

  /* --- URL : https:// ou chemin relatif du site, sinon chaîne vide --- */
  function safeUrl(value) {
    if (value === null || value === undefined) return '';
    var s = String(value).trim();
    if (!s) return '';
    // Les navigateurs ignorent espaces et caractères de contrôle dans le schéma.
    var probe = s.replace(/[\u0000- \u007f]/g, '').toLowerCase();
    if (probe.indexOf('https://') === 0) return s;
    // Relatif : pas de schéma, pas de « // » ni de « \ » (hôte implicite).
    if (/^[a-z][a-z0-9+.\-]*:/.test(probe)) return '';
    if (/^[\/\\]{2}/.test(probe) || /^\/\\|^\\/.test(probe)) return '';
    return s;
  }

  /* Carte : seule l'intégration Google Maps est acceptée. */
  function safeMapUrl(value) {
    var s = safeUrl(value);
    return s.indexOf('https://www.google.com/maps/embed') === 0 ? s : '';
  }

  window.JMSecu = {
    esc: esc,
    escLines: escLines,
    safeUrl: safeUrl,
    safeMapUrl: safeMapUrl
  };
})();
