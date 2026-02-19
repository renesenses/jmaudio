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

    var container = document.getElementById('presentation-cards').parentNode;
    var grid = document.getElementById('presentation-cards');

    // Insert auditorium image before the cards grid
    if (p.imageUrl) {
      var imgDiv = document.createElement('div');
      imgDiv.className = 'presentation-image animate';
      imgDiv.innerHTML = '<img src="' + p.imageUrl + '" alt="Auditorium JM Audio" loading="lazy">';
      container.insertBefore(imgDiv, grid);
    }

    var html = '';
    p.cards.forEach(function (card) {
      html += '<div class="presentation-card animate">' +
        '<div class="presentation-number">' + card.number + '</div>' +
        '<h3>' + card.title + '</h3>' +
        '<p>' + card.description + '</p>' +
        '</div>';
    });
    grid.innerHTML = html;
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
    o.categories.forEach(function (cat, catIndex) {
      var noteHtml = cat.note ? ' <span class="occasions-note">' + cat.note + '</span>' : '';
      html += '<h3 class="occasions-category-title animate">' + cat.name + noteHtml + '</h3>';

      var gridClass = cat.compact ? 'occasions-grid occasions-grid-compact' : 'occasions-grid';
      html += '<div class="' + gridClass + '">';

      cat.products.forEach(function (prod, prodIndex) {
        var cardClass = cat.compact ? 'occasion-card occasion-card-small animate' : 'occasion-card animate';
        html += '<a href="produit.html?cat=' + catIndex + '&prod=' + prodIndex + '" class="occasion-card-link">';
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
          '</div></article></a>';
      });

      html += '</div>';
    });

    document.getElementById('occasions-categories').innerHTML = html;

    document.getElementById('occasions-cta').innerHTML =
      '<p>' + o.ctaText + '</p>' +
      '<a href="#contact" class="occasions-btn">' + o.ctaButtonText + '</a>';
  }

  function formatDateFr(dateStr) {
    var months = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin',
      'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
    var parts = dateStr.split('-');
    var day = parseInt(parts[2], 10);
    var month = months[parseInt(parts[1], 10) - 1];
    var year = parts[0];
    return day + ' ' + month + ' ' + year;
  }

  function renderNews(data) {
    var section = document.getElementById('news');
    if (!data.news || !data.news.items || data.news.items.length === 0) {
      section.style.display = 'none';
      return;
    }

    document.getElementById('news-title').textContent = data.news.sectionTitle;

    // Sort by date descending
    var items = data.news.items.slice().sort(function (a, b) {
      return b.date.localeCompare(a.date);
    });

    var html = '';

    // Featured (latest) news
    var featured = items[0];
    html += '<div class="news-featured animate">';
    if (featured.imageUrl) {
      html += '<div class="news-featured-img"><img src="' + featured.imageUrl + '" alt="' + featured.title + '" loading="lazy"></div>';
    }
    html += '<div class="news-featured-body' + (featured.imageUrl ? '' : ' news-featured-body-full') + '">' +
      '<p class="news-date">' + formatDateFr(featured.date) + '</p>' +
      '<h3 class="news-title">' + featured.title + '</h3>' +
      '<p class="news-excerpt">' + featured.content + '</p>' +
      '</div></div>';

    // Older news (up to 2)
    if (items.length > 1) {
      html += '<div class="news-older">';
      var limit = Math.min(items.length, 3);
      for (var i = 1; i < limit; i++) {
        html += '<div class="news-older-card animate">' +
          '<p class="news-date">' + formatDateFr(items[i].date) + '</p>' +
          '<h3 class="news-title">' + items[i].title + '</h3>' +
          '</div>';
      }
      html += '</div>';
    }

    document.getElementById('news-content').innerHTML = html;
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

  /* --- Contact Modal --- */

  function renderContactModal(data) {
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
  }

  function openContactModal() {
    document.getElementById('contact-modal').classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeContactModal() {
    document.getElementById('contact-modal').classList.remove('open');
    document.body.style.overflow = '';
  }

  function initContactModal() {
    var overlay = document.getElementById('contact-modal');
    var closeBtn = document.getElementById('modal-close');

    if (closeBtn) {
      closeBtn.addEventListener('click', closeContactModal);
    }
    if (overlay) {
      overlay.addEventListener('click', function (e) {
        if (e.target === overlay) closeContactModal();
      });
    }

    // Occasions CTA button
    var occasionsBtn = document.querySelector('.occasions-btn');
    if (occasionsBtn) {
      occasionsBtn.addEventListener('click', function (e) {
        e.preventDefault();
        openContactModal();
      });
    }

    // Escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeContactModal();
    });
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
      renderNews(data);
      renderOccasions(data);
      renderContact(data);
      renderContactModal(data);
      initUI();
      initContactModal();
    })
    .catch(function (err) {
      console.error('Erreur chargement data.json:', err);
    });

})();
