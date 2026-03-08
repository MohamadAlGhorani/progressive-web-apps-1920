(function() {
  "use strict";

  // ============================
  // Service Worker registration
  // ============================
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/service-worker.js")
      .then(function(reg) { return reg.update(); });
  }

  // ============================
  // Header scroll effect
  // ============================
  var header = document.getElementById("site-header");
  if (header) {
    window.addEventListener("scroll", function() {
      if (window.scrollY > 50) {
        header.classList.add("scrolled");
      } else {
        header.classList.remove("scrolled");
      }
    }, { passive: true });
  }

  // ============================
  // Search icon tap → focus input (mobile)
  // ============================
  var searchIcon = document.querySelector(".search-box .search-icon");
  var searchInput = document.getElementById("search");
  if (searchIcon && searchInput) {
    searchIcon.addEventListener("click", function(e) {
      e.preventDefault();
      searchInput.focus();
    });
  }

  // ============================
  // Hamburger menu toggle
  // ============================
  var menuToggle = document.getElementById("menu-toggle");
  var navDrawer = document.getElementById("nav-drawer");

  if (menuToggle && navDrawer) {
    function closeMenu() {
      menuToggle.classList.remove("active");
      navDrawer.classList.remove("open");
      header.classList.remove("menu-open");
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Open menu");
    }

    menuToggle.addEventListener("click", function() {
      var isOpen = menuToggle.classList.toggle("active");
      navDrawer.classList.toggle("open");
      if (isOpen) {
        header.classList.add("menu-open");
      } else {
        header.classList.remove("menu-open");
      }
      menuToggle.setAttribute("aria-expanded", isOpen);
      menuToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
    });

    // Close drawer when clicking a link
    navDrawer.querySelectorAll(".drawer-link").forEach(function(link) {
      link.addEventListener("click", closeMenu);
    });

    // Close drawer on scroll
    window.addEventListener("scroll", function() {
      if (navDrawer.classList.contains("open")) {
        closeMenu();
      }
    }, { passive: true });
  }

  // ============================
  // Hero auto-rotate
  // ============================
  var slides = document.querySelectorAll(".hero-slide");
  var dots = document.querySelectorAll(".hero-dot");

  if (slides.length > 1) {
    var current = 0;
    var interval = null;

    function goToSlide(index) {
      slides[current].classList.remove("active");
      dots[current].classList.remove("active");
      dots[current].setAttribute("aria-selected", "false");
      current = index;
      slides[current].classList.add("active");
      dots[current].classList.add("active");
      dots[current].setAttribute("aria-selected", "true");
    }

    function nextSlide() {
      goToSlide((current + 1) % slides.length);
    }

    function startRotation() {
      interval = setInterval(nextSlide, 5000);
    }

    function resetRotation() {
      clearInterval(interval);
      startRotation();
    }

    dots.forEach(function(dot) {
      dot.addEventListener("click", function() {
        var index = parseInt(this.getAttribute("data-slide"), 10);
        goToSlide(index);
        resetRotation();
      });
    });

    startRotation();
  }

  // ============================
  // Mute/Unmute toggle (detail page trailer)
  // ============================
  var muteBtn = document.getElementById("mute-toggle");
  var trailerIframe = document.getElementById("trailer-player");

  if (muteBtn && trailerIframe) {
    var muted = true;

    muteBtn.addEventListener("click", function() {
      muted = !muted;
      var command = muted ? "mute" : "unMute";
      trailerIframe.contentWindow.postMessage(
        JSON.stringify({ event: "command", func: command }),
        "*"
      );
      var icon = muteBtn.querySelector("i");
      if (muted) {
        icon.className = "fa-solid fa-volume-xmark";
        muteBtn.setAttribute("aria-label", "Unmute trailer");
      } else {
        icon.className = "fa-solid fa-volume-high";
        muteBtn.setAttribute("aria-label", "Mute trailer");
      }
    });
  }

  // ============================
  // Lock movie-row heights to card height
  // ============================
  function syncRowHeights() {
    document.querySelectorAll(".movie-row").forEach(function(row) {
      row.style.height = "";
      var card = row.querySelector(".movie-card");
      if (card) {
        row.style.height = card.offsetHeight + "px";
      }
    });
  }
  syncRowHeights();
  window.addEventListener("resize", syncRowHeights, { passive: true });

  // ============================
  // Card trailer preview (click to expand)
  // ============================
  var trailerCache = {};
  var activeCard = null;

  function closePreview() {
    if (!activeCard) return;
    var iframe = activeCard.querySelector(".card-preview-video");
    if (iframe) iframe.remove();
    var btn = activeCard.querySelector(".card-preview-btn");
    if (btn) btn.remove();
    activeCard.classList.remove("card-previewing");
    activeCard = null;
  }

  function openPreview(card) {
    if (activeCard === card) return;
    closePreview();
    activeCard = card;

    var movieId = card.getAttribute("data-movie-id");
    var href = card.getAttribute("href") || "/movies/" + movieId;

    card.classList.add("card-previewing");

    // Add "View Details" button
    var detailBtn = document.createElement("a");
    detailBtn.href = href;
    detailBtn.className = "card-preview-btn";
    detailBtn.innerHTML = '<i class="fa-solid fa-circle-info"></i> Details';
    card.querySelector(".card-info").appendChild(detailBtn);

    function insertTrailer(key) {
      if (!key || activeCard !== card) return;
      var old = card.querySelector(".card-preview-video");
      if (old) old.remove();

      var iframe = document.createElement("iframe");
      iframe.className = "card-preview-video";
      iframe.src = "https://www.youtube-nocookie.com/embed/" + key + "?autoplay=1&mute=1&controls=0&loop=1&playlist=" + key + "&modestbranding=1&rel=0&showinfo=0";
      iframe.allow = "autoplay; encrypted-media";
      iframe.setAttribute("aria-hidden", "true");
      var info = card.querySelector(".card-info");
      card.insertBefore(iframe, info);
    }

    // Load trailer
    if (trailerCache[movieId] !== undefined) {
      insertTrailer(trailerCache[movieId]);
    } else {
      fetch("/movies/api/trailer/" + movieId)
        .then(function(r) { return r.json(); })
        .then(function(data) {
          trailerCache[movieId] = data.key;
          insertTrailer(data.key);
        })
        .catch(function() { trailerCache[movieId] = null; });
    }
  }

  // Click on card → expand preview (prevent navigation)
  document.addEventListener("click", function(e) {
    if (!e.target || !e.target.closest) return;

    // If clicking the "Details" button, let it navigate
    if (e.target.closest(".card-preview-btn")) return;

    var card = e.target.closest(".movie-card[data-movie-id]");
    if (!card) {
      // Clicked outside any card → close active preview
      closePreview();
      return;
    }

    e.preventDefault();

    if (activeCard === card) {
      // Clicking the active expanded card → navigate
      window.location.href = card.getAttribute("href") || "/movies/" + card.getAttribute("data-movie-id");
    } else {
      openPreview(card);
      card.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  });

  // ============================
  // Search autocomplete
  // ============================
  var searchInput = document.getElementById("search");
  var searchForm = searchInput ? searchInput.closest("form") : null;

  if (searchInput && searchForm) {
    var dropdown = document.createElement("div");
    dropdown.className = "search-dropdown";
    dropdown.setAttribute("role", "listbox");
    dropdown.setAttribute("aria-label", "Search suggestions");
    searchForm.style.position = "relative";
    searchForm.appendChild(dropdown);

    var debounceTimer = null;
    var selectedIdx = -1;

    searchInput.addEventListener("input", function() {
      var query = this.value.trim();
      clearTimeout(debounceTimer);
      selectedIdx = -1;

      if (query.length < 2) {
        dropdown.innerHTML = "";
        dropdown.classList.remove("active");
        return;
      }

      debounceTimer = setTimeout(function() {
        fetch("/movies/api/search?q=" + encodeURIComponent(query))
          .then(function(r) { return r.json(); })
          .then(function(results) {
            if (!results.length) {
              dropdown.innerHTML = '<div class="search-dropdown-empty">No results</div>';
              dropdown.classList.add("active");
              return;
            }

            dropdown.innerHTML = results.map(function(m, i) {
              var poster = m.poster
                ? '<img class="search-dropdown-poster" src="https://image.tmdb.org/t/p/w92/' + m.poster + '" alt="">'
                : '<div class="search-dropdown-poster no-poster-sm"><i class="fa-solid fa-film"></i></div>';
              return '<a href="/movies/' + m.id + '" class="search-dropdown-item" role="option" data-idx="' + i + '">'
                + poster
                + '<div class="search-dropdown-info">'
                + '<div class="search-dropdown-title">' + escapeHtml(m.title) + '</div>'
                + '<div class="search-dropdown-meta">'
                + (m.year ? '<span>' + m.year + '</span>' : '')
                + (m.rating ? '<span class="search-dropdown-rating"><i class="fa-solid fa-star"></i> ' + m.rating + '</span>' : '')
                + '</div></div></a>';
            }).join("");
            dropdown.classList.add("active");
          })
          .catch(function() {
            dropdown.innerHTML = "";
            dropdown.classList.remove("active");
          });
      }, 300);
    });

    // Keyboard navigation
    searchInput.addEventListener("keydown", function(e) {
      var items = dropdown.querySelectorAll(".search-dropdown-item");
      if (!items.length) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        selectedIdx = Math.min(selectedIdx + 1, items.length - 1);
        updateSelection(items);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        selectedIdx = Math.max(selectedIdx - 1, -1);
        updateSelection(items);
      } else if (e.key === "Enter" && selectedIdx >= 0) {
        e.preventDefault();
        items[selectedIdx].click();
      } else if (e.key === "Escape") {
        dropdown.innerHTML = "";
        dropdown.classList.remove("active");
        selectedIdx = -1;
      }
    });

    function updateSelection(items) {
      items.forEach(function(item, i) {
        if (i === selectedIdx) {
          item.classList.add("selected");
          item.scrollIntoView({ block: "nearest" });
        } else {
          item.classList.remove("selected");
        }
      });
    }

    // Close on click outside
    document.addEventListener("click", function(e) {
      if (!searchForm.contains(e.target)) {
        dropdown.innerHTML = "";
        dropdown.classList.remove("active");
      }
    });

    // Focus shows results again
    searchInput.addEventListener("focus", function() {
      if (dropdown.children.length > 0) {
        dropdown.classList.add("active");
      }
    });
  }

  function escapeHtml(str) {
    var div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }
})();
