(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function markMissingImages() {
    document.querySelectorAll('img').forEach(function (image) {
      image.addEventListener('error', function () {
        image.classList.add('is-missing');
      });
    });
  }

  function initMobileMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');

    if (!toggle || !nav) {
      return;
    }

    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function initHeroCarousel() {
    var carousel = document.querySelector('[data-hero-carousel]');

    if (!carousel) {
      return;
    }

    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
    var thumbs = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-thumb]'));
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });

      thumbs.forEach(function (thumb, thumbIndex) {
        thumb.classList.toggle('is-active', thumbIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    thumbs.forEach(function (thumb) {
      thumb.addEventListener('click', function () {
        var nextIndex = Number(thumb.getAttribute('data-hero-thumb')) || 0;
        show(nextIndex);
        start();
      });
    });

    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initCardFilter() {
    var input = document.querySelector('[data-card-filter]');

    if (!input) {
      return;
    }

    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-title]'));
    var empty = document.querySelector('[data-empty-filter]');

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function applyFilter() {
      var query = normalize(input.value);
      var visibleCount = 0;

      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre')
        ].join(' ').toLowerCase();

        var visible = !query || haystack.indexOf(query) !== -1;
        card.hidden = !visible;

        if (visible) {
          visibleCount += 1;
        }
      });

      if (empty) {
        empty.hidden = visibleCount !== 0;
      }
    }

    input.addEventListener('input', applyFilter);
    applyFilter();
  }

  function initBackToTop() {
    var button = document.querySelector('[data-back-to-top]');

    if (!button) {
      return;
    }

    function toggle() {
      button.classList.toggle('is-visible', window.scrollY > 600);
    }

    button.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    window.addEventListener('scroll', toggle, { passive: true });
    toggle();
  }

  ready(function () {
    markMissingImages();
    initMobileMenu();
    initHeroCarousel();
    initCardFilter();
    initBackToTop();
  });
})();
