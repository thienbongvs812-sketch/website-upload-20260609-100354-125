function ready(callback) {
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", callback);
        return;
    }
    callback();
}

function initMobileMenu() {
    const button = document.querySelector("[data-menu-button]");
    const menu = document.querySelector("[data-mobile-nav]");
    if (!button || !menu) {
        return;
    }

    button.addEventListener("click", () => {
        menu.classList.toggle("is-open");
    });
}

function initHeroSlider() {
    const slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
        return;
    }

    const slides = Array.from(slider.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(slider.querySelectorAll("[data-hero-dot]"));
    const previous = slider.querySelector("[data-hero-prev]");
    const next = slider.querySelector("[data-hero-next]");
    let active = Math.max(0, slides.findIndex((slide) => slide.classList.contains("is-active")));
    let timer = null;

    function show(index) {
        if (!slides.length) {
            return;
        }
        active = (index + slides.length) % slides.length;
        slides.forEach((slide, slideIndex) => slide.classList.toggle("is-active", slideIndex === active));
        dots.forEach((dot, dotIndex) => dot.classList.toggle("is-active", dotIndex === active));
    }

    function start() {
        stop();
        timer = window.setInterval(() => show(active + 1), 5200);
    }

    function stop() {
        if (timer) {
            window.clearInterval(timer);
            timer = null;
        }
    }

    previous?.addEventListener("click", () => {
        show(active - 1);
        start();
    });

    next?.addEventListener("click", () => {
        show(active + 1);
        start();
    });

    dots.forEach((dot) => {
        dot.addEventListener("click", () => {
            const index = Number(dot.dataset.heroDot || 0);
            show(index);
            start();
        });
    });

    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    show(active);
    start();
}

async function attachVideoSource(video, source, overlay) {
    if (!source) {
        overlay?.classList.remove("is-loading");
        return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        await video.play().catch(() => undefined);
        return;
    }

    try {
        const module = await import("./hls.js");
        const Hls = module.H;
        if (Hls && Hls.isSupported()) {
            const hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                video.play().catch(() => undefined);
            });
            hls.on(Hls.Events.ERROR, (_event, data) => {
                if (data && data.fatal) {
                    hls.destroy();
                    video.src = source;
                    video.play().catch(() => undefined);
                }
            });
            video.dataset.hlsAttached = "true";
            return;
        }
    } catch (error) {
        console.warn("HLS module fallback", error);
    }

    video.src = source;
    await video.play().catch(() => undefined);
}

function initPlayers() {
    document.querySelectorAll("[data-player]").forEach((player) => {
        const video = player.querySelector("[data-video]");
        const overlay = player.querySelector("[data-player-overlay]");
        const button = player.querySelector("[data-play-button]");
        const source = player.dataset.source || video?.dataset.src || "";

        if (!video || !button) {
            return;
        }

        button.addEventListener("click", async () => {
            overlay?.classList.add("is-loading");
            if (!video.dataset.hlsAttached && !video.src) {
                await attachVideoSource(video, source, overlay);
            } else {
                await video.play().catch(() => undefined);
            }
            overlay?.classList.remove("is-loading");
            overlay?.classList.add("is-hidden");
        });

        video.addEventListener("play", () => overlay?.classList.add("is-hidden"));
        video.addEventListener("pause", () => {
            if (!video.ended) {
                overlay?.classList.remove("is-hidden");
            }
        });
    });
}

function initListingFilters() {
    document.querySelectorAll("[data-filter-panel]").forEach((panel) => {
        const input = panel.querySelector("[data-filter-input]");
        const yearSelect = panel.querySelector("[data-filter-year]");
        const typeSelect = panel.querySelector("[data-filter-type]");
        const count = panel.querySelector("[data-filter-count]");
        const cards = Array.from(panel.querySelectorAll("[data-movie-card]"));

        function applyFilter() {
            const keyword = (input?.value || "").trim().toLowerCase();
            const year = yearSelect?.value || "";
            const type = typeSelect?.value || "";
            let visible = 0;

            cards.forEach((card) => {
                const searchText = card.dataset.search || "";
                const matchKeyword = !keyword || searchText.includes(keyword);
                const matchYear = !year || card.dataset.year === year;
                const matchType = !type || (card.dataset.type || "").includes(type);
                const shouldShow = matchKeyword && matchYear && matchType;
                card.hidden = !shouldShow;
                if (shouldShow) {
                    visible += 1;
                }
            });

            if (count) {
                count.textContent = String(visible);
            }
        }

        input?.addEventListener("input", applyFilter);
        yearSelect?.addEventListener("change", applyFilter);
        typeSelect?.addEventListener("change", applyFilter);
        applyFilter();
    });
}

ready(() => {
    initMobileMenu();
    initHeroSlider();
    initPlayers();
    initListingFilters();
});
