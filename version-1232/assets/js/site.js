(function () {
    var HlsClass = window.Hls;

    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function text(value) {
        return String(value || "").toLowerCase();
    }

    function escapeHTML(value) {
        return String(value || "").replace(/[&<>'"]/g, function (char) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                "'": "&#39;",
                "\"": "&quot;"
            }[char];
        });
    }

    function initHeader() {
        var header = document.querySelector("[data-header]");
        var toggle = document.querySelector("[data-menu-toggle]");
        var menu = document.querySelector("[data-mobile-menu]");
        var updateHeader = function () {
            if (!header) {
                return;
            }
            if (window.scrollY > 20) {
                header.classList.add("is-scrolled");
            } else {
                header.classList.remove("is-scrolled");
            }
        };
        updateHeader();
        window.addEventListener("scroll", updateHeader, { passive: true });
        if (toggle && menu && header) {
            toggle.addEventListener("click", function () {
                var open = menu.classList.toggle("is-open");
                header.classList.toggle("menu-active", open);
                document.body.classList.toggle("menu-open", open);
            });
        }
    }

    function initImages() {
        document.querySelectorAll("img[data-cover]").forEach(function (img) {
            var mark = function () {
                if (!img.naturalWidth) {
                    img.classList.add("is-empty");
                }
            };
            img.addEventListener("error", mark);
            if (img.complete) {
                mark();
            }
        });
    }

    function initHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;
        var show = function (target) {
            index = (target + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        };
        var start = function () {
            clearInterval(timer);
            timer = setInterval(function () {
                show(index + 1);
            }, 5200);
        };
        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
                start();
            });
        });
        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }
        show(0);
        start();
    }

    function initLocalFilter() {
        document.querySelectorAll("[data-filter-panel]").forEach(function (panel) {
            var input = panel.querySelector("[data-list-filter]");
            var select = panel.querySelector("[data-sort-list]");
            var list = panel.querySelector("[data-card-list]");
            if (!list) {
                return;
            }
            var cards = Array.prototype.slice.call(list.querySelectorAll("[data-movie-card]"));
            var apply = function () {
                var query = text(input ? input.value : "");
                cards.forEach(function (card) {
                    var haystack = text([
                        card.getAttribute("data-title"),
                        card.getAttribute("data-year"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-genre"),
                        card.getAttribute("data-type")
                    ].join(" "));
                    card.classList.toggle("is-hidden", query && haystack.indexOf(query) === -1);
                });
            };
            var sort = function () {
                var mode = select ? select.value : "default";
                var sorted = cards.slice();
                if (mode === "rating") {
                    sorted.sort(function (a, b) {
                        return Number(b.getAttribute("data-rating")) - Number(a.getAttribute("data-rating"));
                    });
                }
                if (mode === "year") {
                    sorted.sort(function (a, b) {
                        return Number(b.getAttribute("data-year")) - Number(a.getAttribute("data-year"));
                    });
                }
                sorted.forEach(function (card) {
                    list.appendChild(card);
                });
            };
            if (input) {
                input.addEventListener("input", apply);
            }
            if (select) {
                select.addEventListener("change", function () {
                    sort();
                    apply();
                });
            }
        });
    }

    function initSearchPage() {
        var page = document.querySelector("[data-search-page]");
        var movies = window.SITE_MOVIES || [];
        if (!page || !movies.length) {
            return;
        }
        var form = page.querySelector("[data-search-control]");
        var input = page.querySelector("[data-search-input]");
        var category = page.querySelector("[data-search-category]");
        var results = page.querySelector("[data-search-results]");
        var params = new URLSearchParams(window.location.search);
        var root = page.getAttribute("data-root") || "./";
        if (input && params.get("q")) {
            input.value = params.get("q");
        }
        var renderCard = function (movie) {
            var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
                return "<span>" + escapeHTML(tag) + "</span>";
            }).join("");
            return [
                "<article class=\"movie-card mini-card\" data-movie-card>",
                "<a class=\"poster-frame\" href=\"" + escapeHTML(root + movie.href) + "\">",
                "<span class=\"poster-title\">" + escapeHTML(movie.title) + "</span>",
                "<img src=\"" + escapeHTML(root + movie.cover) + "\" alt=\"" + escapeHTML(movie.title) + "\" loading=\"lazy\" data-cover>",
                "<span class=\"quality-badge\">HD</span>",
                "</a>",
                "<div class=\"card-body\">",
                "<div class=\"card-meta\"><span>" + escapeHTML(movie.year) + "</span><span>" + escapeHTML(movie.type) + "</span><span>" + escapeHTML(movie.region) + "</span></div>",
                "<h3><a href=\"" + escapeHTML(root + movie.href) + "\">" + escapeHTML(movie.title) + "</a></h3>",
                "<p>" + escapeHTML(movie.line) + "</p>",
                "<div class=\"tag-row\">" + tags + "</div>",
                "<div class=\"card-bottom\"><span>⭐ " + escapeHTML(movie.rating) + "</span><a href=\"" + escapeHTML(root + movie.href) + "\">立即观看</a></div>",
                "</div>",
                "</article>"
            ].join("");
        };
        var render = function () {
            var query = text(input ? input.value : "");
            var selected = category ? category.value : "";
            var list = movies.filter(function (movie) {
                var categoryMatch = !selected || movie.category === selected;
                var haystack = text([
                    movie.title,
                    movie.year,
                    movie.region,
                    movie.type,
                    movie.genre,
                    movie.category,
                    movie.line,
                    (movie.tags || []).join(" ")
                ].join(" "));
                return categoryMatch && (!query || haystack.indexOf(query) !== -1);
            }).slice(0, 160);
            if (!results) {
                return;
            }
            if (!list.length) {
                results.innerHTML = "<div class=\"search-empty\">没有匹配影片，请调整关键词后再次搜索。</div>";
                return;
            }
            results.innerHTML = list.map(renderCard).join("");
            initImages();
        };
        if (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                render();
            });
        }
        if (input) {
            input.addEventListener("input", render);
        }
        if (category) {
            category.addEventListener("change", render);
        }
        render();
    }

    function initPlayer() {
        document.querySelectorAll("[data-player]").forEach(function (player) {
            var video = player.querySelector("video");
            var cover = player.querySelector("[data-play]");
            if (!video || !cover) {
                return;
            }
            var stream = video.getAttribute("data-stream") || "";
            var hls = null;
            var prepared = false;
            var shouldPlay = false;
            var playVideo = function () {
                var attempt = video.play();
                if (attempt && typeof attempt.catch === "function") {
                    attempt.catch(function () {
                        player.classList.remove("player-started");
                    });
                }
            };
            var prepare = function () {
                if (prepared || !stream) {
                    return;
                }
                prepared = true;
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = stream;
                    video.addEventListener("loadedmetadata", function () {
                        if (shouldPlay) {
                            playVideo();
                        }
                    }, { once: true });
                    return;
                }
                if (HlsClass && HlsClass.isSupported && HlsClass.isSupported()) {
                    hls = new HlsClass({ enableWorker: true, lowLatencyMode: true });
                    hls.attachMedia(video);
                    if (HlsClass.Events && HlsClass.Events.MEDIA_ATTACHED) {
                        hls.on(HlsClass.Events.MEDIA_ATTACHED, function () {
                            hls.loadSource(stream);
                        });
                    } else {
                        hls.loadSource(stream);
                    }
                    if (HlsClass.Events && HlsClass.Events.MANIFEST_PARSED) {
                        hls.on(HlsClass.Events.MANIFEST_PARSED, function () {
                            if (shouldPlay) {
                                playVideo();
                            }
                        });
                    }
                    return;
                }
                video.src = stream;
            };
            var start = function () {
                shouldPlay = true;
                player.classList.add("player-started");
                video.controls = true;
                prepare();
                if (video.readyState > 0 || video.canPlayType("application/vnd.apple.mpegurl") || !(HlsClass && HlsClass.isSupported && HlsClass.isSupported())) {
                    playVideo();
                }
            };
            cover.addEventListener("click", start);
            video.addEventListener("play", function () {
                player.classList.add("player-started");
            });
            document.querySelectorAll("[data-start-player]").forEach(function (button) {
                button.addEventListener("click", function (event) {
                    event.preventDefault();
                    player.scrollIntoView({ behavior: "smooth", block: "center" });
                    start();
                });
            });
        });
    }

    ready(function () {
        initHeader();
        initImages();
        initHero();
        initLocalFilter();
        initSearchPage();
        initPlayer();
    });
})();
