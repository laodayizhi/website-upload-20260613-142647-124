(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    ready(function () {
        var toggle = document.querySelector("[data-mobile-toggle]");
        var menu = document.querySelector("[data-mobile-menu]");
        if (toggle && menu) {
            toggle.addEventListener("click", function () {
                menu.classList.toggle("is-open");
            });
        }

        var hero = document.querySelector("[data-hero]");
        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
            var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
            var prev = hero.querySelector("[data-hero-prev]");
            var next = hero.querySelector("[data-hero-next]");
            var current = 0;
            var timer = null;

            function show(index) {
                if (!slides.length) {
                    return;
                }
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, i) {
                    slide.classList.toggle("is-active", i === current);
                });
                dots.forEach(function (dot, i) {
                    dot.classList.toggle("is-active", i === current);
                });
            }

            function play() {
                timer = window.setInterval(function () {
                    show(current + 1);
                }, 5200);
            }

            function restart() {
                if (timer) {
                    window.clearInterval(timer);
                }
                play();
            }

            if (prev) {
                prev.addEventListener("click", function () {
                    show(current - 1);
                    restart();
                });
            }

            if (next) {
                next.addEventListener("click", function () {
                    show(current + 1);
                    restart();
                });
            }

            dots.forEach(function (dot, i) {
                dot.addEventListener("click", function () {
                    show(i);
                    restart();
                });
            });

            show(0);
            play();
        }

        var filterPanel = document.querySelector("[data-filter-panel]");
        if (filterPanel) {
            var input = filterPanel.querySelector("[data-filter-input]");
            var year = filterPanel.querySelector("[data-filter-year]");
            var type = filterPanel.querySelector("[data-filter-type]");
            var reset = filterPanel.querySelector("[data-filter-reset]");
            var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
            var empty = document.querySelector("[data-empty-state]");
            var params = new URLSearchParams(window.location.search);
            var initial = params.get("q") || "";

            if (input && initial) {
                input.value = initial;
            }

            function match(card) {
                var q = input ? input.value.trim().toLowerCase() : "";
                var y = year ? year.value : "";
                var t = type ? type.value : "";
                var haystack = [
                    card.getAttribute("data-title") || "",
                    card.getAttribute("data-region") || "",
                    card.getAttribute("data-genre") || "",
                    card.getAttribute("data-tags") || "",
                    card.getAttribute("data-category") || ""
                ].join(" ").toLowerCase();
                var okText = !q || haystack.indexOf(q) !== -1;
                var okYear = !y || (card.getAttribute("data-year") || "") === y;
                var okType = !t || (card.getAttribute("data-type") || "") === t;
                return okText && okYear && okType;
            }

            function apply() {
                var visible = 0;
                cards.forEach(function (card) {
                    var ok = match(card);
                    card.style.display = ok ? "" : "none";
                    if (ok) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("is-visible", visible === 0);
                }
            }

            [input, year, type].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", apply);
                    control.addEventListener("change", apply);
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
                    apply();
                });
            }

            apply();
        }
    });
})();
