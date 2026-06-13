(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function createCard(movie) {
    var article = document.createElement('article');
    article.className = 'movie-card';

    article.innerHTML = [
      '<a href="' + movie.url + '" class="movie-cover">',
      '  <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '  <span class="movie-type">' + escapeHtml(movie.type) + '</span>',
      '  <span class="play-mask" aria-hidden="true">▶</span>',
      '</a>',
      '<div class="movie-card-body">',
      '  <h3><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h3>',
      '  <p class="movie-line">' + escapeHtml(movie.oneLine) + '</p>',
      '  <div class="movie-meta">',
      '    <span>' + escapeHtml(movie.region) + '</span>',
      '    <span>' + escapeHtml(movie.year) + '</span>',
      '  </div>',
      '</div>'
    ].join('');

    return article;
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function initSearch() {
    var movies = window.MOVIE_INDEX || [];
    var form = document.querySelector('[data-search-form]');
    var input = document.querySelector('[data-search-input]');
    var typeSelect = document.querySelector('[data-type-select]');
    var regionSelect = document.querySelector('[data-region-select]');
    var yearSelect = document.querySelector('[data-year-select]');
    var results = document.querySelector('[data-search-results]');
    var count = document.querySelector('[data-search-count]');

    if (!form || !input || !results || !count) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    input.value = params.get('q') || '';

    function matches(movie, query, type, region, year) {
      if (type && movie.type !== type) {
        return false;
      }

      if (region && movie.region !== region) {
        return false;
      }

      if (year && movie.year !== year) {
        return false;
      }

      if (!query) {
        return true;
      }

      var haystack = [
        movie.title,
        movie.region,
        movie.type,
        movie.year,
        movie.genre,
        movie.tags,
        movie.oneLine
      ].join(' ').toLowerCase();

      return haystack.indexOf(query) !== -1;
    }

    function render() {
      var query = normalize(input.value);
      var type = typeSelect ? typeSelect.value : '';
      var region = regionSelect ? regionSelect.value : '';
      var year = yearSelect ? yearSelect.value : '';
      var filtered = movies.filter(function (movie) {
        return matches(movie, query, type, region, year);
      });
      var shown = filtered.slice(0, 240);

      results.innerHTML = '';
      shown.forEach(function (movie) {
        results.appendChild(createCard(movie));
      });

      count.textContent = '共找到 ' + filtered.length + ' 部影片' + (filtered.length > shown.length ? '，当前显示前 ' + shown.length + ' 部。' : '。');
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      render();
    });

    [input, typeSelect, regionSelect, yearSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', render);
        control.addEventListener('change', render);
      }
    });

    render();
  }

  ready(initSearch);
})();
