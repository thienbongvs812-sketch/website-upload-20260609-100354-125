(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var thumbs = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-thumb]'));
    var current = 0;
    var timer = null;

    function activate(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });

      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });

      thumbs.forEach(function (thumb, i) {
        thumb.classList.toggle('active', i === current);
      });
    }

    function start() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        activate(current + 1);
      }, 5000);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        activate(Number(dot.getAttribute('data-hero-dot') || 0));
        start();
      });
    });

    thumbs.forEach(function (thumb) {
      thumb.addEventListener('mouseenter', function () {
        activate(Number(thumb.getAttribute('data-hero-thumb') || 0));
        start();
      });
    });

    activate(0);
    start();
  }

  function setupFilters() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]'));

    scopes.forEach(function (scope) {
      var input = scope.querySelector('[data-search-input]');
      var year = scope.querySelector('[data-year-filter]');
      var type = scope.querySelector('[data-type-filter]');
      var empty = scope.querySelector('[data-empty-message]');
      var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));

      if (!input && !year && !type) {
        return;
      }

      function matchYear(card, value) {
        if (!value) {
          return true;
        }

        var cardYear = card.getAttribute('data-year') || '';
        var yearNumber = parseInt(cardYear.replace(/\D/g, ''), 10) || 0;

        if (value === '2021') {
          return yearNumber <= 2021;
        }

        return cardYear.indexOf(value) !== -1;
      }

      function matchType(card, value) {
        if (!value) {
          return true;
        }

        var cardType = card.getAttribute('data-type') || '';
        var cardGenre = card.getAttribute('data-genre') || '';
        var cardTags = card.getAttribute('data-tags') || '';
        return (cardType + ' ' + cardGenre + ' ' + cardTags).indexOf(value) !== -1;
      }

      function apply() {
        var query = (input ? input.value : '').trim().toLowerCase();
        var selectedYear = year ? year.value : '';
        var selectedType = type ? type.value : '';
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute('data-title') || '',
            card.getAttribute('data-region') || '',
            card.getAttribute('data-year') || '',
            card.getAttribute('data-type') || '',
            card.getAttribute('data-genre') || '',
            card.getAttribute('data-tags') || ''
          ].join(' ').toLowerCase();

          var ok = (!query || haystack.indexOf(query) !== -1) &&
            matchYear(card, selectedYear) &&
            matchType(card, selectedType);

          card.style.display = ok ? '' : 'none';
          if (ok) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle('show', visible === 0);
        }
      }

      [input, year, type].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });
    });
  }

  function setupPlayer() {
    var video = document.getElementById('moviePlayer');
    var button = document.querySelector('[data-play-button]');

    if (!video || !button) {
      return;
    }

    var stream = video.getAttribute('data-stream');
    var hlsInstance = null;
    var ready = false;

    function loadLibrary(callback) {
      if (window.Hls) {
        callback();
        return;
      }

      var existing = document.querySelector('script[data-hls-loader]');
      if (existing) {
        existing.addEventListener('load', callback, { once: true });
        return;
      }

      var script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js';
      script.async = true;
      script.setAttribute('data-hls-loader', 'true');
      script.addEventListener('load', callback, { once: true });
      script.addEventListener('error', function () {
        video.src = stream;
        video.play().catch(function () {});
      }, { once: true });
      document.head.appendChild(script);
    }

    function playVideo() {
      button.classList.add('hide');

      if (!stream) {
        video.play().catch(function () {});
        return;
      }

      if (ready) {
        video.play().catch(function () {});
        return;
      }

      ready = true;

      loadLibrary(function () {
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });

          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });
          hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
            if (!data || !data.fatal) {
              return;
            }

            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hlsInstance.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hlsInstance.recoverMediaError();
            } else {
              hlsInstance.destroy();
              hlsInstance = null;
              video.src = stream;
            }
          });
        } else {
          video.src = stream;
          video.play().catch(function () {});
        }
      });
    }

    button.addEventListener('click', playVideo);
    video.addEventListener('play', function () {
      button.classList.add('hide');
    });
    video.addEventListener('pause', function () {
      if (video.currentTime === 0) {
        button.classList.remove('hide');
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  setupHero();
  setupFilters();
  setupPlayer();
})();
