(function () {
  function select(selector, root) {
    return (root || document).querySelector(selector);
  }

  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function initMobileMenu() {
    var toggle = select('[data-menu-toggle]');
    var panel = select('[data-mobile-panel]');

    if (!toggle || !panel) {
      return;
    }

    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function initHeroSlider() {
    var slides = selectAll('[data-hero-slide]');
    var dots = selectAll('[data-hero-dot]');

    if (slides.length <= 1) {
      return;
    }

    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot') || 0));
        start();
      });
    });

    show(0);
    start();
  }

  function initLocalFilters() {
    selectAll('[data-filter-form]').forEach(function (form) {
      var container = form.parentElement;
      var list = select('[data-filter-list]', container);
      var keywordInput = select('[data-filter-keyword]', form);
      var typeSelect = select('[data-filter-type]', form);
      var yearSelect = select('[data-filter-year]', form);
      var counter = select('[data-filter-count]', form);

      if (!list) {
        return;
      }

      var cards = selectAll('.movie-card', list);

      function update() {
        var keyword = normalize(keywordInput && keywordInput.value);
        var type = normalize(typeSelect && typeSelect.value);
        var year = normalize(yearSelect && yearSelect.value);
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-year'),
            card.getAttribute('data-type'),
            card.getAttribute('data-region'),
            card.getAttribute('data-category'),
            card.getAttribute('data-tags')
          ].join(' '));
          var okKeyword = !keyword || haystack.indexOf(keyword) !== -1;
          var okType = !type || normalize(card.getAttribute('data-type')).indexOf(type) !== -1;
          var okYear = !year || normalize(card.getAttribute('data-year')) === year;
          var visibleNow = okKeyword && okType && okYear;

          card.classList.toggle('is-hidden', !visibleNow);

          if (visibleNow) {
            visible += 1;
          }
        });

        if (counter) {
          counter.textContent = visible + ' 部';
        }
      }

      [keywordInput, typeSelect, yearSelect].forEach(function (element) {
        if (element) {
          element.addEventListener('input', update);
          element.addEventListener('change', update);
        }
      });

      update();
    });
  }

  function movieCardHtml(movie) {
    var tags = (movie.tags || []).slice(0, 4).map(function (tag) {
      return '<span class="tag">' + escapeHtml(tag) + '</span>';
    }).join('');

    return [
      '<article class="movie-card">',
      '  <a class="movie-link" href="' + escapeHtml(movie.detail) + '">',
      '    <div class="poster-wrap">',
      '      <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '封面" loading="lazy">',
      '      <span class="poster-overlay"><span class="play-icon">▶</span><span>立即播放</span></span>',
      '    </div>',
      '    <div class="movie-info">',
      '      <h3>' + escapeHtml(movie.title) + '</h3>',
      '      <p class="movie-meta">' + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.type) + '</p>',
      '      <p class="movie-line">' + escapeHtml(movie.oneLine) + '</p>',
      '      <div class="tag-row">' + tags + '</div>',
      '    </div>',
      '  </a>',
      '</article>'
    ].join('');
  }

  function initSearchPage() {
    var page = select('[data-search-page]');

    if (!page || !window.MOVIE_SEARCH_INDEX) {
      return;
    }

    var form = select('[data-search-form]', page);
    var input = select('[data-search-input]', page);
    var category = select('[data-search-category]', page);
    var type = select('[data-search-type]', page);
    var summary = select('[data-search-summary]', page);
    var results = select('[data-search-results]', page);
    var params = new URLSearchParams(window.location.search);

    if (input && params.get('q')) {
      input.value = params.get('q');
    }

    function render() {
      var keyword = normalize(input && input.value);
      var categoryValue = normalize(category && category.value);
      var typeValue = normalize(type && type.value);
      var movies = window.MOVIE_SEARCH_INDEX.filter(function (movie) {
        var haystack = normalize([
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          movie.category,
          movie.tags && movie.tags.join(' '),
          movie.oneLine
        ].join(' '));
        var okKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var okCategory = !categoryValue || normalize(movie.category) === categoryValue;
        var okType = !typeValue || normalize(movie.type).indexOf(typeValue) !== -1;
        return okKeyword && okCategory && okType;
      });

      if (!keyword && !categoryValue && !typeValue) {
        movies = window.MOVIE_SEARCH_INDEX.slice(0, 60);
      }

      if (summary) {
        summary.textContent = '找到 ' + movies.length + ' 部影片，当前显示前 ' + Math.min(movies.length, 120) + ' 部。';
      }

      if (!movies.length) {
        results.innerHTML = '<div class="no-results">没有找到匹配影片，请换一个关键词。</div>';
        return;
      }

      results.innerHTML = movies.slice(0, 120).map(movieCardHtml).join('');
    }

    if (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        render();
      });
    }

    [input, category, type].forEach(function (element) {
      if (element) {
        element.addEventListener('input', render);
        element.addEventListener('change', render);
      }
    });

    render();
  }

  function initMoviePlayer() {
    var player = select('[data-player]');

    if (!player) {
      return;
    }

    var video = select('video', player);
    var button = select('[data-play-button]', player);
    var state = select('[data-player-state]', player);
    var hlsInstance = null;

    if (!video || !button) {
      return;
    }

    function setState(message) {
      if (state) {
        state.textContent = message;
      }
    }

    function playNative(src) {
      video.src = src;
      video.addEventListener('loadedmetadata', function onLoaded() {
        video.removeEventListener('loadedmetadata', onLoaded);
        video.play().catch(function () {
          setState('播放源已加载，请在播放器控制栏中手动点击播放。');
        });
      });
      video.load();
    }

    function startPlayback() {
      var src = button.getAttribute('data-src');

      if (!src) {
        setState('当前影片暂未绑定播放源。');
        return;
      }

      button.classList.add('is-hidden');
      setState('正在初始化 HLS 播放器并加载 m3u8 播放源...');

      if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false,
          backBufferLength: 90
        });

        hlsInstance.loadSource(src);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          setState('播放源加载成功，正在播放。');
          video.play().catch(function () {
            setState('播放源已加载，请在播放器控制栏中手动点击播放。');
          });
        });
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setState('HLS 播放器遇到错误，已尝试使用浏览器原生方式加载。');
            hlsInstance.destroy();
            hlsInstance = null;
            playNative(src);
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        setState('正在使用浏览器原生 HLS 能力播放。');
        playNative(src);
      } else {
        setState('浏览器不支持 HLS.js 时将尝试直接加载 m3u8 地址。');
        playNative(src);
      }
    }

    button.addEventListener('click', startPlayback);
    video.addEventListener('play', function () {
      button.classList.add('is-hidden');
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMobileMenu();
    initHeroSlider();
    initLocalFilters();
    initSearchPage();
    initMoviePlayer();
  });
}());
