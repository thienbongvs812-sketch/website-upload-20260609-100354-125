(function () {
  function $(selector, parent) {
    return (parent || document).querySelector(selector);
  }

  function $all(selector, parent) {
    return Array.prototype.slice.call((parent || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  var toggle = $("[data-nav-toggle]");
  var panel = $("[data-mobile-panel]");
  if (toggle && panel) {
    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  var hero = $("[data-hero]");
  if (hero) {
    var slides = $all("[data-hero-slide]", hero);
    var dots = $all("[data-hero-dot]", hero);
    var current = 0;
    var show = function (index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    };
    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
      });
    });
    if (slides.length > 1) {
      setInterval(function () {
        show(current + 1);
      }, 5200);
    }
  }

  var grids = $all("[data-filter-grid]");
  grids.forEach(function (grid) {
    var block = grid.closest("section") || document;
    var input = $("[data-filter-input]", block);
    var select = $("[data-filter-type]", block);
    var cards = $all("[data-card]", grid);
    var apply = function () {
      var keyword = normalize(input ? input.value : "");
      var type = normalize(select ? select.value : "");
      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-year")
        ].join(" "));
        var cardType = normalize(card.getAttribute("data-type"));
        var matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchedType = !type || cardType.indexOf(type) !== -1 || haystack.indexOf(type) !== -1;
        card.classList.toggle("is-hidden", !(matchedKeyword && matchedType));
      });
    };
    if (input) {
      input.addEventListener("input", apply);
    }
    if (select) {
      select.addEventListener("change", apply);
    }
  });

  var searchInput = $("#searchInput");
  var searchResults = $("#searchResults");
  var seed = $("[data-search-seed]");
  if (searchInput && searchResults && Array.isArray(window.SITE_MOVIES)) {
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    searchInput.value = initial;
    var escapeHtml = function (value) {
      return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    };
    var render = function () {
      var query = normalize(searchInput.value);
      if (!query) {
        searchResults.classList.remove("is-active");
        searchResults.innerHTML = "";
        if (seed) {
          seed.style.display = "block";
        }
        return;
      }
      var results = window.SITE_MOVIES.filter(function (movie) {
        return normalize([
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          movie.tags,
          movie.oneLine
        ].join(" ")).indexOf(query) !== -1;
      }).slice(0, 120);
      searchResults.classList.add("is-active");
      if (seed) {
        seed.style.display = "none";
      }
      if (!results.length) {
        searchResults.innerHTML = "<h2>未找到相关影片</h2>";
        return;
      }
      var cards = results.map(function (movie) {
        return "<article class=\"movie-card\">" +
          "<a class=\"poster-link\" href=\"" + escapeHtml(movie.url) + "\" aria-label=\"" + escapeHtml(movie.title) + "\">" +
          "<img src=\"" + escapeHtml(movie.image) + "\" alt=\"" + escapeHtml(movie.title) + " 在线观看\" loading=\"lazy\">" +
          "<span class=\"poster-shade\"></span><span class=\"play-mark\">▶</span><span class=\"year-badge\">" + escapeHtml(movie.year) + "</span></a>" +
          "<div class=\"movie-card-body\"><h3><a href=\"" + escapeHtml(movie.url) + "\">" + escapeHtml(movie.title) + "</a></h3>" +
          "<p class=\"card-meta\">" + escapeHtml(movie.region) + " · " + escapeHtml(movie.type) + "</p>" +
          "<p class=\"card-summary\">" + escapeHtml(movie.oneLine) + "</p>" +
          "<div class=\"tag-row\"><span>" + escapeHtml(movie.genre) + "</span></div></div></article>";
      }).join("");
      searchResults.innerHTML = "<h2>搜索结果</h2><div class=\"movie-grid category-page-grid\">" + cards + "</div>";
    };
    searchInput.addEventListener("input", render);
    var form = $("[data-search-form]");
    if (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var url = new URL(window.location.href);
        url.searchParams.set("q", searchInput.value);
        window.history.replaceState({}, "", url.toString());
        render();
      });
    }
    render();
  }
})();
