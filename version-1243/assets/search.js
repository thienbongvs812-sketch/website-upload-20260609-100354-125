
(function () {
    var form = document.querySelector('[data-search-form]');
    var input = document.querySelector('[data-search-input]');
    var results = document.querySelector('[data-search-results]');
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';
    var index = window.MOVIE_SEARCH_INDEX || [];

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function render(items, query) {
        if (!results) {
            return;
        }

        if (!query) {
            results.innerHTML = '<article class="empty-state"><h2>输入关键词查找影片</h2><p>可搜索影片标题、类型、地区、年份与标签。</p></article>';
            return;
        }

        if (!items.length) {
            results.innerHTML = '<article class="empty-state"><h2>未找到匹配影片</h2><p>可以尝试更短的片名、年份或地区关键词。</p></article>';
            return;
        }

        results.innerHTML = items.slice(0, 80).map(function (item) {
            var tags = (item.tags || []).slice(0, 5).map(function (tag) {
                return '<span>' + escapeHtml(tag) + '</span>';
            }).join('');

            return [
                '<article class="search-result-card">',
                '    <a href="' + escapeHtml(item.url) + '"><img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy"></a>',
                '    <div>',
                '        <div class="card-meta"><a href="' + escapeHtml(item.categoryUrl) + '">' + escapeHtml(item.category) + '</a><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.type) + '</span></div>',
                '        <h2><a href="' + escapeHtml(item.url) + '">' + escapeHtml(item.title) + '</a></h2>',
                '        <p>' + escapeHtml(item.oneLine) + '</p>',
                '        <div class="tag-row">' + tags + '</div>',
                '    </div>',
                '    <a class="text-link" href="' + escapeHtml(item.url) + '">立即观看</a>',
                '</article>'
            ].join('');
        }).join('');
    }

    function search(query) {
        var q = query.trim().toLowerCase();
        var terms = q.split(/\s+/).filter(Boolean);

        if (!terms.length) {
            render([], '');
            return;
        }

        var matched = index.filter(function (item) {
            var haystack = [
                item.title,
                item.year,
                item.region,
                item.type,
                item.category,
                item.oneLine,
                (item.tags || []).join(' ')
            ].join(' ').toLowerCase();

            return terms.every(function (term) {
                return haystack.indexOf(term) !== -1;
            });
        });

        render(matched, q);
    }

    if (input) {
        input.value = initialQuery;
        input.addEventListener('input', function () {
            search(input.value);
        });
    }

    if (form) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            var query = input ? input.value : '';
            var nextUrl = query ? 'search.html?q=' + encodeURIComponent(query) : 'search.html';
            window.history.replaceState(null, '', nextUrl);
            search(query);
        });
    }

    search(initialQuery);
})();
