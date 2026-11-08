/* ============================================
   JM Audio — Page produit
   (sorti de produit.html pour la Content-Security-Policy)
   ============================================ */

(function () {
  'use strict';

  var escHtml = window.JMSecu.esc;
  var safeUrl = window.JMSecu.safeUrl;

  var params = new URLSearchParams(window.location.search);
  var catIndex = parseInt(params.get('cat'), 10);
  var prodIndex = parseInt(params.get('prod'), 10);

  if (isNaN(catIndex) || isNaN(prodIndex)) {
    document.getElementById('product-content').innerHTML =
      '<p class="product-not-found">Produit introuvable. <a href="index.html#occasions">Retour aux occasions</a></p>';
    return;
  }

  fetch('data.json')
    .then(function (res) { return res.json(); })
    .then(function (data) {
      var cat = data.occasions.categories[catIndex];
      if (!cat) throw new Error('Catégorie introuvable');
      var prod = cat.products[prodIndex];
      if (!prod) throw new Error('Produit introuvable');

      // Update page title & SEO meta tags
      var seoTitle = prod.brand + ' ' + prod.model + ' occasion — JM Audio Dijon';
      var seoDesc = prod.brand + ' ' + prod.model + ' d\'occasion à ' + prod.price + ' chez JM Audio Dijon. ' + (prod.detail || 'Vérifié et garanti par nos soins.') + ' Revendeur hi-fi haut de gamme.';
      var seoUrl = 'https://www.jmaudio.fr/produit.html?cat=' + catIndex + '&prod=' + prodIndex;
      var mainUrl = safeUrl(prod.imageUrl);
      var seoImg = mainUrl ? 'https://www.jmaudio.fr/' + mainUrl : 'https://www.jmaudio.fr/img/auditorium.jpg';

      document.title = seoTitle;
      updateMeta('description', seoDesc);
      updateMeta('og:title', seoTitle, true);
      updateMeta('og:description', seoDesc, true);
      updateMeta('og:url', seoUrl, true);
      updateMeta('og:image', seoImg, true);
      updateMeta('twitter:title', seoTitle);
      updateMeta('twitter:description', seoDesc);
      updateMeta('twitter:image', seoImg);
      document.querySelector('link[rel="canonical"]').setAttribute('href', seoUrl);

      // Inject Product JSON-LD
      var priceNum = prod.price.replace(/[^\d,]/g, '').replace(',', '.');
      var productSchema = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        'name': prod.brand + ' ' + prod.model,
        'description': prod.detail || (prod.brand + ' ' + prod.model + ' d\'occasion'),
        'brand': {'@type': 'Brand', 'name': prod.brand},
        'category': cat.name,
        'itemCondition': 'https://schema.org/UsedCondition',
        'url': seoUrl,
        'offers': {
          '@type': 'Offer',
          'price': priceNum,
          'priceCurrency': 'EUR',
          'availability': 'https://schema.org/InStock',
          'url': seoUrl,
          'seller': {
            '@type': 'LocalBusiness',
            'name': 'JM Audio',
            'address': {'@type': 'PostalAddress', 'addressLocality': 'Dijon', 'postalCode': '21000', 'addressCountry': 'FR'}
          }
        }
      };
      if (mainUrl) {
        productSchema.image = 'https://www.jmaudio.fr/' + mainUrl;
      }
      injectJsonLd(productSchema);

      // Inject BreadcrumbList JSON-LD
      injectJsonLd({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
          {'@type': 'ListItem', 'position': 1, 'name': 'Accueil', 'item': 'https://www.jmaudio.fr/'},
          {'@type': 'ListItem', 'position': 2, 'name': 'Occasions', 'item': 'https://www.jmaudio.fr/#occasions'},
          {'@type': 'ListItem', 'position': 3, 'name': cat.name},
          {'@type': 'ListItem', 'position': 4, 'name': prod.brand + ' ' + prod.model}
        ]
      });

      // Update breadcrumb
      var breadcrumbProd = document.getElementById('breadcrumb-product');
      if (breadcrumbProd) breadcrumbProd.textContent = prod.brand + ' ' + prod.model;

      // Build all images array (main image + additional images)
      var allImages = [];
      if (mainUrl) {
        allImages.push(mainUrl);
      }
      if (prod.images && prod.images.length) {
        prod.images.forEach(function (img) {
          var u = safeUrl(img);
          if (u) allImages.push(u);
        });
      }

      var html = '<div class="product-layout">';

      // Gallery column
      html += '<div class="product-gallery">';
      if (allImages.length > 0) {
        html += '<div class="product-main-img" id="main-img-container">' +
          '<img src="' + escHtml(allImages[0]) + '" alt="' + escHtml(prod.brand + ' ' + prod.model) + '" id="main-img">' +
          '</div>';
        if (allImages.length > 1) {
          html += '<div class="product-thumbs">';
          allImages.forEach(function (img, i) {
            var activeClass = i === 0 ? ' active' : '';
            html += '<div class="product-thumb' + activeClass + '" data-index="' + i + '">' +
              '<img src="' + escHtml(img) + '" alt="Photo ' + (i + 1) + '">' +
              '</div>';
          });
          html += '</div>';
        }
      } else {
        html += '<div class="product-no-image">Pas de photo disponible</div>';
      }
      html += '</div>';

      // Info column
      html += '<div class="product-info">';
      html += '<p class="product-brand">' + escHtml(prod.brand) + '</p>';
      html += '<h1 class="product-model">' + escHtml(prod.model) + '</h1>';
      if (prod.detail) {
        html += '<p class="product-detail">' + escHtml(prod.detail) + '</p>';
      }
      html += '<p class="product-price">' + escHtml(prod.price) + '</p>';
      if (prod.description) {
        html += '<div class="product-description">' + escHtml(prod.description) + '</div>';
      }
      html += '<button type="button" class="product-cta" id="product-contact-btn">Nous contacter</button>';
      html += '</div>';

      html += '</div>';

      document.getElementById('product-content').innerHTML = html;

      // Thumbnail click handler
      if (allImages.length > 1) {
        var mainImg = document.getElementById('main-img');
        var thumbs = document.querySelectorAll('.product-thumb');
        thumbs.forEach(function (thumb) {
          thumb.addEventListener('click', function () {
            var idx = parseInt(thumb.dataset.index, 10);
            mainImg.src = allImages[idx];
            thumbs.forEach(function (t) { t.classList.remove('active'); });
            thumb.classList.add('active');
          });
        });
      }

      // Lightbox
      var lightbox = document.getElementById('lightbox');
      var lightboxImg = document.getElementById('lightbox-img');
      var mainImgContainer = document.getElementById('main-img-container');
      if (mainImgContainer) {
        mainImgContainer.addEventListener('click', function () {
          var src = document.getElementById('main-img').src;
          lightboxImg.src = src;
          lightbox.classList.add('open');
        });
      }
      lightbox.addEventListener('click', function () {
        lightbox.classList.remove('open');
      });

      // Contact modal
      var c = data.contact;
      var phoneLink = 'tel:+33' + c.phone.replace(/\s/g, '').replace(/^0/, '');
      var emailLink = 'mailto:' + c.email;
      var phoneEl = document.getElementById('modal-phone');
      var emailEl = document.getElementById('modal-email');
      if (phoneEl) {
        phoneEl.href = phoneLink;
        document.getElementById('modal-phone-text').textContent = c.phone;
      }
      if (emailEl) {
        emailEl.href = emailLink;
        document.getElementById('modal-email-text').textContent = c.email;
      }

      var modalOverlay = document.getElementById('contact-modal');
      var modalClose = document.getElementById('modal-close');
      function openModal() {
        modalOverlay.classList.add('open');
        document.body.style.overflow = 'hidden';
      }
      function closeModal() {
        modalOverlay.classList.remove('open');
        document.body.style.overflow = '';
      }
      modalClose.addEventListener('click', closeModal);
      modalOverlay.addEventListener('click', function (e) {
        if (e.target === modalOverlay) closeModal();
      });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeModal();
      });

      var productContactBtn = document.getElementById('product-contact-btn');
      if (productContactBtn) {
        productContactBtn.addEventListener('click', function (e) {
          e.preventDefault();
          openModal();
        });
      }

      // Mobile menu
      var toggle = document.getElementById('menu-toggle');
      var navLinks = document.getElementById('nav-links');
      toggle.addEventListener('click', function () {
        toggle.classList.toggle('active');
        navLinks.classList.toggle('open');
        document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
      });
      navLinks.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', function () {
          toggle.classList.remove('active');
          navLinks.classList.remove('open');
          document.body.style.overflow = '';
        });
      });
    })
    .catch(function (err) {
      console.error(err);
      document.getElementById('product-content').innerHTML =
        '<p class="product-not-found">Produit introuvable. <a href="index.html#occasions">Retour aux occasions</a></p>';
    });

  function updateMeta(nameOrProp, content, isProperty) {
    var selector = isProperty
      ? 'meta[property="' + nameOrProp + '"]'
      : 'meta[name="' + nameOrProp + '"]';
    var el = document.querySelector(selector);
    if (el) el.setAttribute('content', content);
  }

  function injectJsonLd(obj) {
    var script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(obj);
    document.head.appendChild(script);
  }
})();
