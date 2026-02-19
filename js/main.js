/* ============================================
   JM Audio — Main Script
   ============================================ */

(function () {
  'use strict';

  /* --- SVG Icon Registry --- */
  var ICONS = {
    headphones: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>',
    location: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/><circle cx="12" cy="10" r="3"/></svg>',
    person: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>'
  };

  /* --- Render Functions --- */

  function renderHero(data) {
    var h = data.hero;
    document.getElementById('hero-subtitle').textContent = h.subtitle;
    document.getElementById('hero-title').innerHTML = h.title + '<br><em>' + h.titleEmphasis + '</em>';
    document.getElementById('hero-cta').textContent = h.ctaText;
  }

  function renderPresentation(data) {
    var p = data.presentation;
    document.getElementById('presentation-title').textContent = p.sectionTitle;

    var html = '';
    p.cards.forEach(function (card) {
      html += '<div class="presentation-card animate">' +
        '<div class="presentation-number">' + card.number + '</div>' +
        '<h3>' + card.title + '</h3>' +
        '<p>' + card.description + '</p>' +
        '</div>';
    });
    document.getElementById('presentation-cards').innerHTML = html;
  }

  function renderMarques(data) {
    var m = data.marques;
    document.getElementById('marques-title').textContent = m.sectionTitle;
    document.getElementById('marques-intro').textContent = m.intro;

    var html = '';
    m.categories.forEach(function (cat) {
      html += '<div class="marques-category animate">' +
        '<h3 class="marques-category-title">' + cat.name + '</h3>' +
        '<div class="marques-grid">';
      cat.brands.forEach(function (brand) {
        if (brand.url) {
          html += '<a href="' + brand.url + '" class="marque" target="_blank" rel="noopener">' + brand.name + '</a>';
        } else {
          html += '<span class="marque">' + brand.name + '</span>';
        }
      });
      html += '</div></div>';
    });
    document.getElementById('marques-categories').innerHTML = html;
  }

  function renderServices(data) {
    var s = data.services;
    document.getElementById('services-title').textContent = s.sectionTitle;

    var html = '';
    s.cards.forEach(function (card) {
      var iconSvg = ICONS[card.icon] || '';
      html += '<div class="service-card animate">' +
        '<div class="service-icon">' + iconSvg + '</div>' +
        '<h3>' + card.title + '</h3>' +
        '<p>' + card.description + '</p>' +
        '</div>';
    });
    document.getElementById('services-cards').innerHTML = html;
  }

  function renderOccasions(data) {
    var o = data.occasions;
    document.getElementById('occasions-title').textContent = o.sectionTitle;
    document.getElementById('occasions-intro').textContent = o.intro;

    var html = '';
    o.categories.forEach(function (cat) {
      var noteHtml = cat.note ? ' <span class="occasions-note">' + cat.note + '</span>' : '';
      html += '<h3 class="occasions-category-title animate">' + cat.name + noteHtml + '</h3>';

      var gridClass = cat.compact ? 'occasions-grid occasions-grid-compact' : 'occasions-grid';
      html += '<div class="' + gridClass + '">';

      cat.products.forEach(function (prod) {
        var cardClass = cat.compact ? 'occasion-card occasion-card-small animate' : 'occasion-card animate';
        html += '<article class="' + cardClass + '">';

        if (prod.imageUrl) {
          html += '<div class="occasion-img">' +
            '<img src="' + prod.imageUrl + '" alt="' + prod.brand + ' ' + prod.model + '" loading="lazy">' +
            '</div>';
        }

        html += '<div class="occasion-body">' +
          '<h3 class="occasion-brand">' + prod.brand + '</h3>' +
          '<p class="occasion-model">' + prod.model + '</p>';

        if (prod.detail) {
          html += '<p class="occasion-detail">' + prod.detail + '</p>';
        }

        html += '<p class="occasion-price">' + prod.price + '</p>' +
          '</div></article>';
      });

      html += '</div>';
    });

    document.getElementById('occasions-categories').innerHTML = html;

    document.getElementById('occasions-cta').innerHTML =
      '<p>' + o.ctaText + '</p>' +
      '<a href="#contact" class="occasions-btn">' + o.ctaButtonText + '</a>';
  }

  function renderContact(data) {
    var c = data.contact;
    document.getElementById('contact-title').textContent = c.sectionTitle;

    var addressHtml = c.address.replace(/\n/g, '<br>');
    var hoursHtml = c.hours.replace(/\n/g, '<br>');

    document.getElementById('contact-content').innerHTML =
      '<div class="contact-info animate">' +
        '<div class="contact-block">' +
          '<h3>Adresse</h3>' +
          '<p>' + addressHtml + '</p>' +
        '</div>' +
        '<div class="contact-block">' +
          '<h3>Horaires</h3>' +
          '<p>' + hoursHtml + '</p>' +
        '</div>' +
        '<div class="contact-block">' +
          '<h3>Contact</h3>' +
          '<p><a href="tel:+33' + c.phone.replace(/\s/g, '').replace(/^0/, '') + '" class="contact-link">' + c.phone + '</a></p>' +
        '</div>' +
      '</div>' +
      '<div class="contact-map animate">' +
        '<iframe src="' + c.mapEmbedUrl + '" width="100%" height="100%" style="border:0; min-height: 300px;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade" title="Localisation JM Audio à Dijon"></iframe>' +
      '</div>';
  }

  /* --- UI Initialization (scroll, menu, observer) --- */

  function initUI() {
    // Navbar scroll effect
    var navbar = document.getElementById('navbar');
    function updateNavbar() {
      navbar.classList.toggle('scrolled', window.scrollY > 60);
    }
    window.addEventListener('scroll', updateNavbar, { passive: true });
    updateNavbar();

    // Mobile menu toggle
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

    // Scroll animations (Intersection Observer) — after render
    var animatedElements = document.querySelectorAll('.animate');

    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add('visible');
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15 }
      );

      animatedElements.forEach(function (el) {
        observer.observe(el);
      });
    } else {
      animatedElements.forEach(function (el) {
        el.classList.add('visible');
      });
    }
  }

  /* --- Boot --- */

  fetch('data.json')
    .then(function (res) { return res.json(); })
    .then(function (data) {
      renderHero(data);
      renderPresentation(data);
      renderMarques(data);
      renderServices(data);
      renderOccasions(data);
      renderContact(data);
      initUI();
    })
    .catch(function (err) {
      console.error('Erreur chargement data.json:', err);
    });

})();
