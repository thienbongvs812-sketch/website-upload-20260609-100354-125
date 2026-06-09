import { MOVIES } from "./movies-data.js";

function createCard(movie) {
    const tags = movie.tags.slice(0, 3).map((tag) => `<span>${escapeHtml(tag)}</span>`).join("");
    return `
<article class="movie-card" data-movie-card>
    <a class="poster-shell" href="${movie.url}" aria-label="观看 ${escapeHtml(movie.title)}">
        <span class="poster-title-fallback">${escapeHtml(movie.title)}</span>
        <img class="poster-image" src="${movie.cover}" alt="${escapeHtml(movie.title)}" loading="lazy" onerror="this.classList.add('is-hidden')">
        <span class="poster-play">▶</span>
    </a>
    <div class="movie-card-body">
        <div class="movie-meta-line">
            <span>${escapeHtml(movie.year)}</span>
            <span>${escapeHtml(movie.region)}</span>
            <span>${escapeHtml(movie.type)}</span>
        </div>
        <h3><a href="${movie.url}">${escapeHtml(movie.title)}</a></h3>
        <p>${escapeHtml(movie.oneLine)}</p>
        <div class="tag-row">${tags}</div>
    </div>
</article>`;
}

function escapeHtml(value) {
    return String(value || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function normalize(value) {
    return String(value || "").trim().toLowerCase();
}

function renderResults() {
    const input = document.querySelector("#searchInput");
    const typeSelect = document.querySelector("#searchType");
    const results = document.querySelector("#searchResults");
    const status = document.querySelector("#searchStatus");
    if (!input || !typeSelect || !results || !status) {
        return;
    }

    const keyword = normalize(input.value);
    const type = typeSelect.value;
    const filtered = MOVIES.filter((movie) => {
        const haystack = normalize([
            movie.title,
            movie.region,
            movie.type,
            movie.year,
            movie.genre,
            movie.tags.join(" "),
            movie.oneLine
        ].join(" "));
        const matchKeyword = !keyword || haystack.includes(keyword);
        const matchType = !type || movie.type.includes(type);
        return matchKeyword && matchType;
    });

    const limited = filtered.slice(0, 120);
    results.innerHTML = limited.map(createCard).join("\n");
    status.textContent = filtered.length
        ? `找到 ${filtered.length} 条结果，当前展示前 ${limited.length} 条。`
        : "没有找到匹配内容，可以更换关键词。";
}

function initSearch() {
    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get("q") || "";
    const input = document.querySelector("#searchInput");
    const typeSelect = document.querySelector("#searchType");
    const button = document.querySelector("#searchButton");

    if (!input || !typeSelect || !button) {
        return;
    }

    input.value = initialQuery;
    input.addEventListener("input", renderResults);
    typeSelect.addEventListener("change", renderResults);
    button.addEventListener("click", renderResults);
    renderResults();
}

initSearch();
