(() => {
  const menuButton = document.querySelector(".menu-toggle");
  const mobilePanel = document.querySelector(".mobile-panel");

  if (menuButton && mobilePanel) {
    menuButton.addEventListener("click", () => {
      const expanded = menuButton.getAttribute("aria-expanded") === "true";
      menuButton.setAttribute("aria-expanded", String(!expanded));
      mobilePanel.classList.toggle("open");
    });
  }

  const slides = Array.from(document.querySelectorAll(".hero-slide"));
  const dots = Array.from(document.querySelectorAll(".hero-dot"));
  const prev = document.querySelector(".hero-prev");
  const next = document.querySelector(".hero-next");
  let current = 0;
  let timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    current = (index + slides.length) % slides.length;

    slides.forEach((slide, i) => {
      slide.classList.toggle("active", i === current);
    });

    dots.forEach((dot, i) => {
      dot.classList.toggle("active", i === current);
    });
  }

  function restartHero() {
    if (!slides.length) {
      return;
    }

    window.clearInterval(timer);
    timer = window.setInterval(() => showSlide(current + 1), 6000);
  }

  dots.forEach((dot, i) => {
    dot.addEventListener("click", () => {
      showSlide(i);
      restartHero();
    });
  });

  if (prev) {
    prev.addEventListener("click", () => {
      showSlide(current - 1);
      restartHero();
    });
  }

  if (next) {
    next.addEventListener("click", () => {
      showSlide(current + 1);
      restartHero();
    });
  }

  restartHero();

  const catalog = document.querySelector(".search-catalog");

  if (catalog) {
    const input = catalog.querySelector(".filter-input");
    const type = catalog.querySelector(".filter-type");
    const year = catalog.querySelector(".filter-year");
    const cards = Array.from(catalog.querySelectorAll(".movie-card"));
    const params = new URLSearchParams(window.location.search);
    const initial = params.get("q") || "";

    if (input && initial) {
      input.value = initial;
    }

    function normalize(value) {
      return String(value || "").trim().toLowerCase();
    }

    function applyFilters() {
      const keyword = normalize(input ? input.value : "");
      const selectedType = type ? type.value : "";
      const selectedYear = year ? year.value : "";

      cards.forEach((card) => {
        const haystack = normalize([
          card.dataset.title,
          card.dataset.region,
          card.dataset.year,
          card.dataset.genre,
          card.dataset.type,
          card.textContent
        ].join(" "));
        const typeMatch = !selectedType || card.dataset.type === selectedType;
        const yearMatch = !selectedYear || card.dataset.year === selectedYear;
        const keywordMatch = !keyword || haystack.includes(keyword);
        card.style.display = typeMatch && yearMatch && keywordMatch ? "" : "none";
      });
    }

    [input, type, year].forEach((control) => {
      if (control) {
        control.addEventListener("input", applyFilters);
        control.addEventListener("change", applyFilters);
      }
    });

    applyFilters();
  }
})();
