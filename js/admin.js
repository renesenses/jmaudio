/* ============================================
   JM Audio — Admin Script
   ============================================ */

(function () {
  'use strict';

  var REPO = 'renesenses/jmaudio';
  var FILE_PATH = 'data.json';
  var API_BASE = 'https://api.github.com';

  var token = '';
  var currentData = null;
  var currentSha = '';

  /* --- Icon choices for services --- */
  var ICON_OPTIONS = [
    { value: 'headphones', label: 'Casque (headphones)' },
    { value: 'location', label: 'Localisation (location)' },
    { value: 'person', label: 'Personne (person)' }
  ];

  /* =========================================
     DOM references
     ========================================= */
  var loginScreen = document.getElementById('login-screen');
  var adminPanel = document.getElementById('admin-panel');
  var tokenInput = document.getElementById('github-token');
  var loginBtn = document.getElementById('login-btn');
  var loginError = document.getElementById('login-error');
  var saveBtn = document.getElementById('save-btn');
  var saveStatus = document.getElementById('save-status');
  var logoutBtn = document.getElementById('logout-btn');
  var tabsContainer = document.getElementById('admin-tabs');

  /* =========================================
     Auth
     ========================================= */

  function showError(msg) {
    loginError.textContent = msg;
    loginError.hidden = false;
  }

  function hideError() {
    loginError.hidden = true;
  }

  function apiHeaders() {
    return {
      'Authorization': 'token ' + token,
      'Accept': 'application/vnd.github.v3+json'
    };
  }

  function fetchDataFromGitHub() {
    return fetch(API_BASE + '/repos/' + REPO + '/contents/' + FILE_PATH, {
      headers: apiHeaders()
    })
    .then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    })
    .then(function (file) {
      currentSha = file.sha;
      var decoded = decodeURIComponent(escape(atob(file.content.replace(/\n/g, ''))));
      return JSON.parse(decoded);
    });
  }

  function login() {
    var t = tokenInput.value.trim();
    if (!t) {
      showError('Veuillez saisir un token.');
      return;
    }
    hideError();
    loginBtn.textContent = 'Connexion...';
    loginBtn.disabled = true;
    token = t;

    fetchDataFromGitHub()
      .then(function (data) {
        currentData = data;
        localStorage.setItem('jmaudio_token', token);
        loginScreen.hidden = true;
        adminPanel.hidden = false;
        populateAllForms(data);
      })
      .catch(function (err) {
        token = '';
        showError('Échec de connexion. Vérifiez votre token et les droits du repo.');
        console.error(err);
      })
      .finally(function () {
        loginBtn.textContent = 'Connexion';
        loginBtn.disabled = false;
      });
  }

  function logout() {
    token = '';
    currentData = null;
    currentSha = '';
    localStorage.removeItem('jmaudio_token');
    adminPanel.hidden = true;
    loginScreen.hidden = false;
    tokenInput.value = '';
  }

  // Auto-login from stored token
  function tryAutoLogin() {
    var stored = localStorage.getItem('jmaudio_token');
    if (stored) {
      token = stored;
      tokenInput.value = stored;
      loginBtn.textContent = 'Connexion...';
      loginBtn.disabled = true;

      fetchDataFromGitHub()
        .then(function (data) {
          currentData = data;
          loginScreen.hidden = true;
          adminPanel.hidden = false;
          populateAllForms(data);
        })
        .catch(function () {
          token = '';
          localStorage.removeItem('jmaudio_token');
        })
        .finally(function () {
          loginBtn.textContent = 'Connexion';
          loginBtn.disabled = false;
        });
    }
  }

  /* =========================================
     Save to GitHub
     ========================================= */

  function saveToGitHub() {
    collectAllForms();

    var content = JSON.stringify(currentData, null, 2);
    var encoded = btoa(unescape(encodeURIComponent(content)));

    saveBtn.disabled = true;
    saveStatus.textContent = 'Enregistrement...';
    saveStatus.className = 'save-status';

    fetch(API_BASE + '/repos/' + REPO + '/contents/' + FILE_PATH, {
      method: 'PUT',
      headers: apiHeaders(),
      body: JSON.stringify({
        message: 'Mise à jour contenu via admin',
        content: encoded,
        sha: currentSha
      })
    })
    .then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    })
    .then(function (result) {
      currentSha = result.content.sha;
      saveStatus.textContent = 'Enregistré !';
      saveStatus.className = 'save-status success';
      setTimeout(function () { saveStatus.textContent = ''; }, 3000);
    })
    .catch(function (err) {
      saveStatus.textContent = 'Erreur : ' + err.message;
      saveStatus.className = 'save-status error';
      console.error(err);
    })
    .finally(function () {
      saveBtn.disabled = false;
    });
  }

  /* =========================================
     Tabs
     ========================================= */

  function initTabs() {
    tabsContainer.addEventListener('click', function (e) {
      var btn = e.target.closest('.tab');
      if (!btn) return;
      var tabName = btn.dataset.tab;

      tabsContainer.querySelectorAll('.tab').forEach(function (t) { t.classList.remove('active'); });
      btn.classList.add('active');

      document.querySelectorAll('.tab-panel').forEach(function (p) { p.classList.remove('active'); });
      document.getElementById('panel-' + tabName).classList.add('active');
    });
  }

  /* =========================================
     Populate forms from data
     ========================================= */

  function populateAllForms(data) {
    // Simple fields (data-path)
    document.querySelectorAll('[data-path]').forEach(function (el) {
      var val = getNestedValue(data, el.dataset.path);
      if (val !== undefined) {
        el.value = val;
      }
    });

    // Repeatable sections
    renderPresentationCards(data.presentation.cards);
    renderMarquesCategories(data.marques.categories);
    renderServicesCards(data.services.cards);
    renderOccasionsCategories(data.occasions.categories);
  }

  function getNestedValue(obj, path) {
    return path.split('.').reduce(function (o, key) {
      return o && o[key] !== undefined ? o[key] : undefined;
    }, obj);
  }

  function setNestedValue(obj, path, value) {
    var keys = path.split('.');
    var last = keys.pop();
    var target = keys.reduce(function (o, key) {
      if (o[key] === undefined) o[key] = {};
      return o[key];
    }, obj);
    target[last] = value;
  }

  /* =========================================
     Collect forms back to data
     ========================================= */

  function collectAllForms() {
    // Simple fields
    document.querySelectorAll('[data-path]').forEach(function (el) {
      setNestedValue(currentData, el.dataset.path, el.value);
    });

    // Repeatable sections
    currentData.presentation.cards = collectPresentationCards();
    currentData.marques.categories = collectMarquesCategories();
    currentData.services.cards = collectServicesCards();
    currentData.occasions.categories = collectOccasionsCategories();
  }

  /* =========================================
     Presentation Cards
     ========================================= */

  function renderPresentationCards(cards) {
    var list = document.getElementById('presentation-cards-list');
    list.innerHTML = '';
    cards.forEach(function (card, i) {
      list.appendChild(createPresentationCardBlock(card, i));
    });
  }

  function createPresentationCardBlock(card, index) {
    var block = document.createElement('div');
    block.className = 'repeatable-block';
    block.innerHTML =
      '<div class="block-header"><h3>Carte ' + (index + 1) + '</h3><button class="btn btn-danger btn-remove-pres-card">Supprimer</button></div>' +
      '<div class="form-row">' +
        '<div class="form-group"><label>Nombre/Symbole</label><input type="text" class="pres-number" value="' + escAttr(card.number) + '"></div>' +
        '<div class="form-group"><label>Titre</label><input type="text" class="pres-title" value="' + escAttr(card.title) + '"></div>' +
      '</div>' +
      '<div class="form-group"><label>Description</label><textarea class="pres-desc" rows="2">' + escHtml(card.description) + '</textarea></div>';

    block.querySelector('.btn-remove-pres-card').addEventListener('click', function () {
      block.remove();
    });
    return block;
  }

  function collectPresentationCards() {
    var cards = [];
    document.querySelectorAll('#presentation-cards-list .repeatable-block').forEach(function (block) {
      cards.push({
        number: block.querySelector('.pres-number').value,
        title: block.querySelector('.pres-title').value,
        description: block.querySelector('.pres-desc').value
      });
    });
    return cards;
  }

  /* =========================================
     Marques Categories
     ========================================= */

  function renderMarquesCategories(categories) {
    var list = document.getElementById('marques-categories-list');
    list.innerHTML = '';
    categories.forEach(function (cat, i) {
      list.appendChild(createMarquesCategoryBlock(cat, i));
    });
  }

  function createMarquesCategoryBlock(cat, index) {
    var block = document.createElement('div');
    block.className = 'repeatable-block';
    block.innerHTML =
      '<div class="block-header"><h3>' + escHtml(cat.name || 'Catégorie ' + (index + 1)) + '</h3><button class="btn btn-danger btn-remove-marques-cat">Supprimer</button></div>' +
      '<div class="form-group"><label>Nom de la catégorie</label><input type="text" class="marques-cat-name" value="' + escAttr(cat.name) + '"></div>' +
      '<div class="form-group"><label>Marques (une par ligne)</label><textarea class="marques-cat-brands" rows="4">' + escHtml(cat.brands.join('\n')) + '</textarea></div>';

    block.querySelector('.btn-remove-marques-cat').addEventListener('click', function () {
      block.remove();
    });
    return block;
  }

  function collectMarquesCategories() {
    var categories = [];
    document.querySelectorAll('#marques-categories-list .repeatable-block').forEach(function (block) {
      var brands = block.querySelector('.marques-cat-brands').value
        .split('\n')
        .map(function (b) { return b.trim(); })
        .filter(function (b) { return b.length > 0; });
      categories.push({
        name: block.querySelector('.marques-cat-name').value,
        brands: brands
      });
    });
    return categories;
  }

  /* =========================================
     Services Cards
     ========================================= */

  function renderServicesCards(cards) {
    var list = document.getElementById('services-cards-list');
    list.innerHTML = '';
    cards.forEach(function (card, i) {
      list.appendChild(createServicesCardBlock(card, i));
    });
  }

  function createServicesCardBlock(card, index) {
    var block = document.createElement('div');
    block.className = 'repeatable-block';

    var iconOptions = ICON_OPTIONS.map(function (opt) {
      var sel = opt.value === card.icon ? ' selected' : '';
      return '<option value="' + opt.value + '"' + sel + '>' + escHtml(opt.label) + '</option>';
    }).join('');

    block.innerHTML =
      '<div class="block-header"><h3>Service ' + (index + 1) + '</h3><button class="btn btn-danger btn-remove-svc-card">Supprimer</button></div>' +
      '<div class="form-group"><label>Icône</label><select class="svc-icon">' + iconOptions + '</select></div>' +
      '<div class="form-group"><label>Titre</label><input type="text" class="svc-title" value="' + escAttr(card.title) + '"></div>' +
      '<div class="form-group"><label>Description</label><textarea class="svc-desc" rows="2">' + escHtml(card.description) + '</textarea></div>';

    block.querySelector('.btn-remove-svc-card').addEventListener('click', function () {
      block.remove();
    });
    return block;
  }

  function collectServicesCards() {
    var cards = [];
    document.querySelectorAll('#services-cards-list .repeatable-block').forEach(function (block) {
      cards.push({
        icon: block.querySelector('.svc-icon').value,
        title: block.querySelector('.svc-title').value,
        description: block.querySelector('.svc-desc').value
      });
    });
    return cards;
  }

  /* =========================================
     Occasions Categories + Products
     ========================================= */

  function renderOccasionsCategories(categories) {
    var list = document.getElementById('occasions-categories-list');
    list.innerHTML = '';
    categories.forEach(function (cat, i) {
      list.appendChild(createOccasionsCategoryBlock(cat, i));
    });
  }

  function createOccasionsCategoryBlock(cat, index) {
    var block = document.createElement('div');
    block.className = 'repeatable-block';

    block.innerHTML =
      '<div class="block-header"><h3>' + escHtml(cat.name || 'Catégorie ' + (index + 1)) + '</h3><button class="btn btn-danger btn-remove-occ-cat">Supprimer</button></div>' +
      '<div class="form-row">' +
        '<div class="form-group"><label>Nom de la catégorie</label><input type="text" class="occ-cat-name" value="' + escAttr(cat.name) + '"></div>' +
        '<div class="form-group"><label>Note (ex: "(la paire)")</label><input type="text" class="occ-cat-note" value="' + escAttr(cat.note || '') + '"></div>' +
      '</div>' +
      '<div class="form-check"><input type="checkbox" class="occ-cat-compact" id="compact-' + index + '"' + (cat.compact ? ' checked' : '') + '><label for="compact-' + index + '">Affichage compact (câbles)</label></div>' +
      '<div class="nested-list occ-products-list"></div>' +
      '<button class="btn btn-add btn-add-product">+ Ajouter un produit</button>';

    block.querySelector('.btn-remove-occ-cat').addEventListener('click', function () {
      block.remove();
    });

    var productsList = block.querySelector('.occ-products-list');
    if (cat.products) {
      cat.products.forEach(function (prod, j) {
        productsList.appendChild(createProductBlock(prod, j));
      });
    }

    block.querySelector('.btn-add-product').addEventListener('click', function () {
      var count = productsList.children.length;
      productsList.appendChild(createProductBlock({ brand: '', model: '', detail: '', price: '', imageUrl: '' }, count));
    });

    return block;
  }

  function createProductBlock(prod, index) {
    var block = document.createElement('div');
    block.className = 'nested-block';
    block.innerHTML =
      '<div class="block-header"><h4>Produit ' + (index + 1) + '</h4><button class="btn btn-danger btn-remove-product">Suppr.</button></div>' +
      '<div class="form-row">' +
        '<div class="form-group"><label>Marque</label><input type="text" class="prod-brand" value="' + escAttr(prod.brand) + '"></div>' +
        '<div class="form-group"><label>Prix</label><input type="text" class="prod-price" value="' + escAttr(prod.price) + '"></div>' +
      '</div>' +
      '<div class="form-group"><label>Modèle</label><input type="text" class="prod-model" value="' + escAttr(prod.model) + '"></div>' +
      '<div class="form-group"><label>Détail / État</label><input type="text" class="prod-detail" value="' + escAttr(prod.detail) + '"></div>' +
      '<div class="form-group"><label>URL image (vide si pas d\'image)</label><input type="text" class="prod-image" value="' + escAttr(prod.imageUrl) + '"></div>';

    block.querySelector('.btn-remove-product').addEventListener('click', function () {
      block.remove();
    });
    return block;
  }

  function collectOccasionsCategories() {
    var categories = [];
    document.querySelectorAll('#occasions-categories-list > .repeatable-block').forEach(function (block) {
      var products = [];
      block.querySelectorAll('.nested-block').forEach(function (pb) {
        products.push({
          brand: pb.querySelector('.prod-brand').value,
          model: pb.querySelector('.prod-model').value,
          detail: pb.querySelector('.prod-detail').value,
          price: pb.querySelector('.prod-price').value,
          imageUrl: pb.querySelector('.prod-image').value
        });
      });
      categories.push({
        name: block.querySelector('.occ-cat-name').value,
        note: block.querySelector('.occ-cat-note').value,
        compact: block.querySelector('.occ-cat-compact').checked,
        products: products
      });
    });
    return categories;
  }

  /* =========================================
     "Add" buttons for top-level repeatables
     ========================================= */

  function initAddButtons() {
    document.getElementById('add-presentation-card').addEventListener('click', function () {
      var list = document.getElementById('presentation-cards-list');
      var count = list.children.length;
      list.appendChild(createPresentationCardBlock({ number: '', title: '', description: '' }, count));
    });

    document.getElementById('add-marques-category').addEventListener('click', function () {
      var list = document.getElementById('marques-categories-list');
      var count = list.children.length;
      list.appendChild(createMarquesCategoryBlock({ name: '', brands: [] }, count));
    });

    document.getElementById('add-services-card').addEventListener('click', function () {
      var list = document.getElementById('services-cards-list');
      var count = list.children.length;
      list.appendChild(createServicesCardBlock({ icon: 'headphones', title: '', description: '' }, count));
    });

    document.getElementById('add-occasions-category').addEventListener('click', function () {
      var list = document.getElementById('occasions-categories-list');
      var count = list.children.length;
      list.appendChild(createOccasionsCategoryBlock({ name: '', note: '', compact: false, products: [] }, count));
    });
  }

  /* =========================================
     Utilities
     ========================================= */

  function escAttr(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function escHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  /* =========================================
     Init
     ========================================= */

  loginBtn.addEventListener('click', login);
  tokenInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') login();
  });
  logoutBtn.addEventListener('click', logout);
  saveBtn.addEventListener('click', saveToGitHub);

  initTabs();
  initAddButtons();
  tryAutoLogin();

})();
