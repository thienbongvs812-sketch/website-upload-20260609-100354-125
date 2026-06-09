(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobileNav = document.querySelector('.mobile-nav');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var current = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === current);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === current);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  var filterInput = document.querySelector('.filter-input');
  var filterSelect = document.querySelector('.filter-select');
  var filterCards = Array.prototype.slice.call(document.querySelectorAll('.filter-card'));

  function normalize(text) {
    return String(text || '').toLowerCase().trim();
  }

  function applyFilter() {
    var query = filterInput ? normalize(filterInput.value) : '';
    var category = filterSelect ? filterSelect.value : '';

    filterCards.forEach(function (card) {
      var text = normalize(card.getAttribute('data-search') || card.textContent);
      var cardCategory = card.getAttribute('data-category') || '';
      var matchesText = !query || text.indexOf(query) !== -1;
      var matchesCategory = !category || cardCategory === category;
      card.classList.toggle('is-filtered-out', !(matchesText && matchesCategory));
    });
  }

  if (filterInput) {
    filterInput.addEventListener('input', applyFilter);
  }

  if (filterSelect) {
    filterSelect.addEventListener('change', applyFilter);
  }

  var player = document.querySelector('.js-player');

  if (player) {
    var video = player.querySelector('video');
    var cover = player.querySelector('.player-cover');
    var url = player.getAttribute('data-video-url');
    var hlsInstance = null;

    function loadVideo() {
      if (!video || !url) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        if (!video.src) {
          video.src = url;
        }
      } else if (window.Hls && window.Hls.isSupported()) {
        if (!hlsInstance) {
          hlsInstance = new window.Hls();
          hlsInstance.loadSource(url);
          hlsInstance.attachMedia(video);
        }
      } else if (!video.src) {
        video.src = url;
      }
    }

    function startVideo() {
      loadVideo();
      if (cover) {
        cover.classList.add('is-hidden');
      }
      video.controls = true;
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    }

    if (cover) {
      cover.addEventListener('click', startVideo);
    }

    video.addEventListener('click', startVideo);
  }
})();
