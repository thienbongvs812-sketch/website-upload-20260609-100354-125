(function () {
    var toggle = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-menu]');

    if (toggle && menu) {
        toggle.addEventListener('click', function () {
            menu.classList.toggle('is-open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('is-active', dotIndex === current);
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

    var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));

    panels.forEach(function (panel) {
        var root = panel.parentElement;
        var input = panel.querySelector('[data-search-input]');
        var region = panel.querySelector('[data-region-filter]');
        var type = panel.querySelector('[data-type-filter]');
        var cards = Array.prototype.slice.call(root.querySelectorAll('[data-movie-card]'));

        function norm(value) {
            return String(value || '').toLowerCase().trim();
        }

        function applyFilter() {
            var keyword = norm(input && input.value);
            var regionValue = norm(region && region.value);
            var typeValue = norm(type && type.value);

            cards.forEach(function (card) {
                var haystack = norm([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-keywords')
                ].join(' '));
                var okKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                var okRegion = !regionValue || norm(card.getAttribute('data-region')).indexOf(regionValue) !== -1;
                var okType = !typeValue || norm(card.getAttribute('data-type')).indexOf(typeValue) !== -1;
                card.classList.toggle('is-hidden', !(okKeyword && okRegion && okType));
            });
        }

        [input, region, type].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilter);
                control.addEventListener('change', applyFilter);
            }
        });
    });
}());

function initMoviePlayer(source) {
    var video = document.querySelector('[data-movie-player]');
    var button = document.querySelector('[data-play-button]');
    var hlsInstance = null;
    var loaded = false;

    if (!video || !source) {
        return;
    }

    function loadSource() {
        if (loaded) {
            return;
        }
        loaded = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
            return;
        }

        video.src = source;
    }

    function playVideo() {
        loadSource();
        if (button) {
            button.classList.add('is-hidden');
        }
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {
                if (button) {
                    button.classList.remove('is-hidden');
                }
            });
        }
    }

    if (button) {
        button.addEventListener('click', playVideo);
    }

    video.addEventListener('click', function () {
        if (video.paused) {
            playVideo();
        }
    });

    window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}
