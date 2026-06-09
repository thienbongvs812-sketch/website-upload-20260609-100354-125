
(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('is-open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var activeIndex = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        activeIndex = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === activeIndex);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('is-active', dotIndex === activeIndex);
        });
    }

    dots.forEach(function (dot, dotIndex) {
        dot.addEventListener('click', function () {
            showSlide(dotIndex);
        });
    });

    if (slides.length > 1) {
        window.setInterval(function () {
            showSlide(activeIndex + 1);
        }, 5600);
    }

    var filterBars = Array.prototype.slice.call(document.querySelectorAll('[data-filter-bar]'));

    filterBars.forEach(function (bar) {
        var root = bar.closest('section');
        var list = root ? root.querySelector('[data-filter-list]') : document.querySelector('[data-filter-list]');
        var cards = list ? Array.prototype.slice.call(list.querySelectorAll('.movie-card')) : [];
        var keywordInput = bar.querySelector('[data-filter-keyword]');
        var yearSelect = bar.querySelector('[data-filter-year]');
        var typeSelect = bar.querySelector('[data-filter-type]');

        function applyFilter() {
            var keyword = keywordInput ? keywordInput.value.trim().toLowerCase() : '';
            var year = yearSelect ? yearSelect.value : '';
            var type = typeSelect ? typeSelect.value : '';

            cards.forEach(function (card) {
                var haystack = [
                    card.dataset.title,
                    card.dataset.region,
                    card.dataset.type,
                    card.dataset.category,
                    card.dataset.tags,
                    card.dataset.year
                ].join(' ').toLowerCase();
                var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                var matchYear = !year || card.dataset.year === year;
                var matchType = !type || card.dataset.type === type;
                card.classList.toggle('is-hidden', !(matchKeyword && matchYear && matchType));
            });
        }

        if (keywordInput) {
            keywordInput.addEventListener('input', applyFilter);
        }
        if (yearSelect) {
            yearSelect.addEventListener('change', applyFilter);
        }
        if (typeSelect) {
            typeSelect.addEventListener('change', applyFilter);
        }
    });
})();
