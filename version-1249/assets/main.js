(function () {
    var toggle = document.querySelector("[data-nav-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    if (toggle && mobileNav) {
        toggle.addEventListener("click", function () {
            mobileNav.classList.toggle("is-open");
        });
    }

    var hero = document.querySelector("[data-hero]");

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var current = 0;
        var timer = null;

        function showSlide(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function startTimer() {
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                window.clearInterval(timer);
                showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
                startTimer();
            });
        });

        if (slides.length > 1) {
            startTimer();
        }
    }

    document.querySelectorAll("[data-filter-root]").forEach(function (root) {
        var input = root.querySelector("[data-filter-input]");
        var year = root.querySelector("[data-year-filter]");
        var type = root.querySelector("[data-type-filter]");
        var region = root.querySelector("[data-region-filter]");
        var reset = root.querySelector("[data-filter-reset]");
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card-list] .movie-card, [data-card-list] .rank-item"));

        function normalized(value) {
            return (value || "").toString().trim().toLowerCase();
        }

        function applyFilter() {
            var keyword = normalized(input ? input.value : "");
            var selectedYear = year ? year.value : "";
            var selectedType = type ? type.value : "";
            var selectedRegion = region ? region.value : "";

            cards.forEach(function (card) {
                var source = normalized(card.getAttribute("data-search"));
                var cardYear = card.getAttribute("data-year") || "";
                var cardType = card.getAttribute("data-type") || "";
                var cardRegion = card.getAttribute("data-region") || "";
                var okKeyword = !keyword || source.indexOf(keyword) !== -1;
                var okYear = !selectedYear || cardYear === selectedYear;
                var okType = !selectedType || cardType === selectedType;
                var okRegion = !selectedRegion || cardRegion === selectedRegion;
                card.classList.toggle("is-filter-hidden", !(okKeyword && okYear && okType && okRegion));
            });
        }

        [input, year, type, region].forEach(function (control) {
            if (control) {
                control.addEventListener("input", applyFilter);
                control.addEventListener("change", applyFilter);
            }
        });

        if (reset) {
            reset.addEventListener("click", function () {
                if (input) {
                    input.value = "";
                }
                if (year) {
                    year.value = "";
                }
                if (type) {
                    type.value = "";
                }
                if (region) {
                    region.value = "";
                }
                applyFilter();
            });
        }

        var params = new URLSearchParams(window.location.search);
        var query = params.get("q");
        if (query && input) {
            input.value = query;
            applyFilter();
        }
    });
})();

function initMoviePlayer(source) {
    var video = document.getElementById("movie-player");
    var overlay = document.getElementById("player-overlay");
    var attached = false;
    var hlsInstance = null;

    function attach() {
        if (!video || attached) {
            return;
        }

        attached = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: false
            });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
            return;
        }

        video.src = source;
    }

    function play() {
        attach();

        if (overlay) {
            overlay.classList.add("is-hidden");
        }

        if (video) {
            video.controls = true;
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {
                    video.controls = true;
                });
            }
        }
    }

    if (overlay) {
        overlay.addEventListener("click", play);
    }

    if (video) {
        video.addEventListener("click", function () {
            if (!attached) {
                play();
            }
        });
    }

    window.addEventListener("pagehide", function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}