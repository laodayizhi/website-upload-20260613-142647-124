(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobileNav = document.querySelector('.mobile-nav');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('img').forEach(function (image) {
    image.addEventListener('error', function () {
      image.classList.add('image-hidden');
    });
  });

  var carousel = document.querySelector('[data-hero-carousel]');

  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('.hero-dot'));
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function startCarousel() {
      stopCarousel();
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }

    function stopCarousel() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        showSlide(dotIndex);
        startCarousel();
      });
    });

    carousel.addEventListener('mouseenter', stopCarousel);
    carousel.addEventListener('mouseleave', startCarousel);
    startCarousel();
  }

  var searchInput = document.getElementById('site-search-input');
  var searchResults = document.getElementById('search-results');
  var searchTitle = document.getElementById('search-title');
  var searchDescription = document.getElementById('search-desc');

  if (searchInput && searchResults && window.SITE_MOVIES) {
    var params = new URLSearchParams(window.location.search);
    var query = (params.get('q') || '').trim();

    if (query) {
      searchInput.value = query;
      renderSearch(query);
    }

    searchInput.addEventListener('input', function () {
      renderSearch(searchInput.value.trim());
    });
  }

  function renderSearch(query) {
    if (!query) {
      return;
    }

    var keyword = query.toLowerCase();
    var matches = window.SITE_MOVIES.filter(function (movie) {
      var text = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.oneLine, movie.tags.join(' ')].join(' ').toLowerCase();
      return text.indexOf(keyword) !== -1;
    }).slice(0, 60);

    searchTitle.textContent = '搜索结果';
    searchDescription.textContent = query;
    searchResults.innerHTML = matches.map(createSearchCard).join('');

    searchResults.querySelectorAll('img').forEach(function (image) {
      image.addEventListener('error', function () {
        image.classList.add('image-hidden');
      });
    });
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (item) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[item];
    });
  }

  function createSearchCard(movie) {
    return '<article class="movie-card">' +
      '<a href="' + escapeHtml(movie.url) + '">' +
      '<div class="poster-wrap">' +
      '<img src="' + escapeHtml(movie.image) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
      '<div class="image-fallback"></div>' +
      '<span class="type-badge">' + escapeHtml(movie.type) + '</span>' +
      '<span class="play-hover">▶</span>' +
      '</div>' +
      '<div class="card-body">' +
      '<h3>' + escapeHtml(movie.title) + '</h3>' +
      '<p>' + escapeHtml(movie.oneLine) + '</p>' +
      '<div class="meta-row"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.year) + '</span></div>' +
      '</div>' +
      '</a>' +
      '</article>';
  }
})();

function initMoviePlayer(sourceUrl, videoId, coverId) {
  var video = document.getElementById(videoId);
  var cover = document.getElementById(coverId);

  if (!video || !cover || !sourceUrl) {
    return;
  }

  var loaded = false;
  var hls = null;

  function attachVideo() {
    if (loaded) {
      return;
    }

    loaded = true;
    video.controls = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = sourceUrl;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(sourceUrl);
      hls.attachMedia(video);
      return;
    }

    video.src = sourceUrl;
  }

  function playVideo() {
    attachVideo();
    cover.classList.add('is-hidden');

    var playResult = video.play();

    if (playResult && typeof playResult.catch === 'function') {
      playResult.catch(function () {
        cover.classList.remove('is-hidden');
      });
    }
  }

  cover.addEventListener('click', playVideo);

  video.addEventListener('click', function () {
    if (video.paused) {
      playVideo();
    } else {
      video.pause();
    }
  });

  window.addEventListener('pagehide', function () {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
}
