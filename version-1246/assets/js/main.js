(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero-carousel]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var current = 0;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        showSlide(i);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }
  }

  document.querySelectorAll('[data-filter-panel]').forEach(function (panel) {
    var input = panel.querySelector('[data-search-input]');
    var buttons = Array.prototype.slice.call(panel.querySelectorAll('[data-filter]'));
    var target = document.querySelector(panel.getAttribute('data-filter-panel'));
    var empty = document.querySelector(panel.getAttribute('data-empty-target'));
    var cards = target ? Array.prototype.slice.call(target.querySelectorAll('.movie-card')) : [];
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';

    if (input && query) {
      input.value = query;
    }

    function activeType() {
      var active = buttons.find(function (button) {
        return button.classList.contains('is-active');
      });
      return active ? active.getAttribute('data-filter') : 'all';
    }

    function normalize(value) {
      return (value || '').toString().trim().toLowerCase();
    }

    function apply() {
      var words = normalize(input ? input.value : '');
      var type = activeType();
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize(card.getAttribute('data-search'));
        var cardType = card.getAttribute('data-type') || '';
        var typeMatched = type === 'all' || cardType.indexOf(type) !== -1;
        var queryMatched = !words || haystack.indexOf(words) !== -1;
        var show = typeMatched && queryMatched;
        card.style.display = show ? '' : 'none';
        if (show) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    if (input) {
      input.addEventListener('input', apply);
    }

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        buttons.forEach(function (item) {
          item.classList.remove('is-active');
        });
        button.classList.add('is-active');
        apply();
      });
    });

    apply();
  });
})();
