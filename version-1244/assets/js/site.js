(function () {
    var app = {};

    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    function initMobileNavigation() {
        var toggle = document.querySelector("[data-mobile-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");

        if (!toggle || !panel) {
            return;
        }

        toggle.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    function initHero() {
        var hero = document.querySelector("[data-hero]");

        if (!hero) {
            return;
        }

        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function start() {
            if (timer || slides.length < 2) {
                return;
            }

            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
                stop();
                start();
            });
        });

        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function initSearchScopes() {
        var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-search-scope]"));

        scopes.forEach(function (scope) {
            var input = scope.querySelector("[data-search-input]");
            var items = Array.prototype.slice.call(scope.querySelectorAll("[data-search-item]"));
            var empty = scope.querySelector("[data-search-empty]");
            var buttons = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-value]"));
            var activeFilter = "";

            if (!input || !items.length) {
                return;
            }

            if (input.getAttribute("data-query-param")) {
                var params = new URLSearchParams(window.location.search);
                var queryValue = params.get(input.getAttribute("data-query-param"));
                if (queryValue) {
                    input.value = queryValue;
                }
            }

            function apply() {
                var keyword = normalize(input.value);
                var visible = 0;

                items.forEach(function (item) {
                    var haystack = normalize(item.getAttribute("data-search-text"));
                    var keywordMatched = !keyword || haystack.indexOf(keyword) !== -1;
                    var filterMatched = !activeFilter || haystack.indexOf(normalize(activeFilter)) !== -1;
                    var matched = keywordMatched && filterMatched;

                    item.classList.toggle("is-hidden", !matched);

                    if (matched) {
                        visible += 1;
                    }
                });

                if (empty) {
                    empty.classList.toggle("is-visible", visible === 0);
                }
            }

            input.addEventListener("input", apply);

            buttons.forEach(function (button) {
                button.addEventListener("click", function () {
                    activeFilter = button.getAttribute("data-filter-value") || "";
                    buttons.forEach(function (item) {
                        item.classList.toggle("is-active", item === button);
                    });
                    apply();
                });
            });

            apply();
        });
    }

    app.initPlayer = function (streamUrl) {
        var video = document.getElementById("movieVideo");
        var overlay = document.getElementById("playOverlay");
        var hlsInstance = null;
        var loaded = false;

        if (!video || !streamUrl) {
            return;
        }

        function hideOverlay() {
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
        }

        function playVideo() {
            var result = video.play();

            if (result && typeof result.catch === "function") {
                result.catch(function () {});
            }
        }

        function loadAndPlay() {
            hideOverlay();

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                if (!loaded) {
                    video.src = streamUrl;
                    loaded = true;
                }
                playVideo();
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                if (!hlsInstance) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(streamUrl);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        playVideo();
                    });
                    loaded = true;
                }
                playVideo();
                return;
            }

            if (!loaded) {
                video.src = streamUrl;
                loaded = true;
            }
            playVideo();
        }

        if (overlay) {
            overlay.addEventListener("click", function (event) {
                event.preventDefault();
                loadAndPlay();
            });
        }

        video.addEventListener("click", function () {
            if (video.paused) {
                loadAndPlay();
            }
        });
    };

    ready(function () {
        initMobileNavigation();
        initHero();
        initSearchScopes();
    });

    window.MovieApp = app;
})();
