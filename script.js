(() => {
  "use strict";
  const body = document.body;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const header = document.querySelector("[data-header]");
  const navLinks = [...document.querySelectorAll('.topbar__nav a[href^="#"]')];
  const sectionIndex = document.querySelector("[data-index-current]");
  const updateHeader = () => {
    header?.classList.toggle("is-scrolled", window.scrollY > 40);
    body.classList.toggle("at-hero", window.scrollY < window.innerHeight * .55);
  };
  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  const menuButton = document.querySelector("[data-menu]");
  const mobileMenu = document.querySelector("[data-mobile-menu]");
  const setMenu = open => {
    menuButton?.classList.toggle("is-open", open);
    mobileMenu?.classList.toggle("is-open", open);
    mobileMenu?.setAttribute("aria-hidden", String(!open));
    body.classList.toggle("menu-open", open);
  };
  menuButton?.addEventListener("click", () => setMenu(!menuButton.classList.contains("is-open")));
  mobileMenu?.querySelectorAll("a").forEach(link => link.addEventListener("click", () => setMenu(false)));

  const glow = document.querySelector(".cursor-glow");
  if (glow && !reduceMotion && window.matchMedia("(pointer:fine)").matches) {
    window.addEventListener("pointermove", event => {
      glow.style.opacity = "1";
      glow.style.transform = `translate3d(${event.clientX}px,${event.clientY}px,0)`;
    }, { passive: true });
  }

  const heroWord = document.querySelector("[data-hero-word]");
  const heroWords = ["zostają.", "pracują.", "dojrzewają.", "działają."];
  let heroWordIndex = 0;
  if (heroWord && !reduceMotion) {
    window.setInterval(() => {
      heroWord.classList.add("is-switching");
      window.setTimeout(() => {
        heroWordIndex = (heroWordIndex + 1) % heroWords.length;
        heroWord.textContent = heroWords[heroWordIndex];
        heroWord.classList.remove("is-switching");
      }, 250);
    }, 2850);
  }

  const parallaxRoot = document.querySelector("[data-parallax-root]");
  const parallaxItems = [...document.querySelectorAll("[data-depth]")];
  if (parallaxRoot && !reduceMotion && window.matchMedia("(pointer:fine)").matches) {
    parallaxRoot.addEventListener("pointermove", event => {
      const rect = parallaxRoot.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - .5;
      const y = (event.clientY - rect.top) / rect.height - .5;
      parallaxItems.forEach(item => {
        const depth = Number(item.dataset.depth || 0);
        item.style.translate = `${x * depth}px ${y * depth}px`;
      });
    });
    parallaxRoot.addEventListener("pointerleave", () => {
      parallaxItems.forEach(item => item.style.translate = "0 0");
    });
  }

  const revealItems = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: .15 });
    revealItems.forEach(item => revealObserver.observe(item));
  } else {
    revealItems.forEach(item => item.classList.add("is-visible"));
  }

  const indexedSections = [...document.querySelectorAll("[data-section-index]")];
  if ("IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting).sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      const index = visible.target.dataset.sectionIndex;
      if (sectionIndex) sectionIndex.textContent = index;
      navLinks.forEach(link => {
        const target = document.querySelector(link.getAttribute("href"));
        link.classList.toggle("is-active", target === visible.target);
      });
    }, { rootMargin: "-28% 0px -55% 0px", threshold: [0.08,.22,.45] });
    indexedSections.forEach(section => sectionObserver.observe(section));
  }

  const projectsSection = document.querySelector(".projects-scroll");
  const projectTrack = document.querySelector("[data-project-track]");
  const projectCurrent = document.querySelector("[data-project-scroll-current]");
  const projectBar = document.querySelector("[data-project-scroll-bar]");
  const updateHorizontalProjects = () => {
    if (!projectsSection || !projectTrack || window.innerWidth <= 760) return;
    const rect = projectsSection.getBoundingClientRect();
    const scrollable = projectsSection.offsetHeight - window.innerHeight;
    const progress = Math.max(0, Math.min(1, -rect.top / scrollable));
    const maxTranslate = Math.max(0, projectTrack.scrollWidth - window.innerWidth + window.innerWidth * .16);
    projectTrack.style.transform = `translate3d(${-progress * maxTranslate}px,0,0)`;
    if (projectBar) projectBar.style.width = `${progress * 100}%`;
    const active = Math.min(3, Math.floor(progress * 4));
    if (projectCurrent) projectCurrent.textContent = String(active + 1).padStart(2,"0");
  };
  updateHorizontalProjects();
  window.addEventListener("scroll", updateHorizontalProjects, { passive: true });
  window.addEventListener("resize", updateHorizontalProjects);

  const lightbox = document.querySelector("[data-lightbox]");
  const lightboxImage = document.querySelector("[data-lightbox-image]");
  const lightboxTitle = document.querySelector("[data-lightbox-title]");
  const lightboxSubtitle = document.querySelector("[data-lightbox-subtitle]");
  const closeLightbox = () => {
    lightbox?.classList.remove("is-open");
    lightbox?.setAttribute("aria-hidden", "true");
    body.classList.remove("lightbox-open");
  };
  document.querySelectorAll("[data-open-project]").forEach(button => {
    button.addEventListener("click", () => {
      if (!lightbox) return;
      lightboxImage.src = button.dataset.image || "";
      lightboxImage.alt = button.dataset.title || "";
      lightboxTitle.textContent = button.dataset.title || "";
      lightboxSubtitle.textContent = button.dataset.subtitle || "";
      lightbox.classList.add("is-open");
      lightbox.setAttribute("aria-hidden", "false");
      body.classList.add("lightbox-open");
    });
  });
  document.querySelector("[data-close-lightbox]")?.addEventListener("click", closeLightbox);
  lightbox?.addEventListener("click", event => { if (event.target === lightbox) closeLightbox(); });

  const scopeImage = document.querySelector("[data-scope-free-image]");
  const scopeButtons = [...document.querySelectorAll("[data-scope-free]")];
  const activateScope = button => {
    scopeButtons.forEach(item => item.classList.toggle("is-active", item === button));
    const image = button.dataset.image;
    if (!scopeImage || !image || scopeImage.getAttribute("src") === image) return;
    scopeImage.classList.add("is-switching");
    window.setTimeout(() => {
      scopeImage.src = image;
      scopeImage.classList.remove("is-switching");
    }, 240);
  };
  scopeButtons.forEach(button => {
    button.addEventListener("mouseenter", () => activateScope(button));
    button.addEventListener("focus", () => activateScope(button));
    button.addEventListener("click", () => activateScope(button));
  });

  const deckCards = [...document.querySelectorAll("[data-deck-card]")];
  const deck = document.querySelector(".packages-deck__cards");
  const activateDeck = card => {
    deckCards.forEach(item => item.classList.toggle("is-active", item === card));
    deck?.classList.add("has-active");
  };
  deckCards.forEach(card => {
    card.addEventListener("mouseenter", () => activateDeck(card));
    card.addEventListener("focus", () => activateDeck(card));
    card.addEventListener("click", () => activateDeck(card));
  });
  deck?.addEventListener("mouseleave", () => {
    deck.classList.remove("has-active");
    deckCards.forEach((card,index) => card.classList.toggle("is-active", index === 0));
  });

  const orbitNodes = [...document.querySelectorAll("[data-orbit-node]")];
  const orbitData = [
    {number:"01",label:"Etap pierwszy",title:"Analiza lokalu",description:"Poznajemy sposób użytkowania, możliwości lokalu i ograniczenia techniczne. Ustalamy kierunek kolejnych decyzji.",result:"jasny kierunek dalszej pracy"},
    {number:"02",label:"Etap drugi",title:"Inwentaryzacja",description:"Dokładnie mierzymy przestrzeń, fotografujemy stan istniejący i porządkujemy materiał do dalszej pracy.",result:"komplet danych wyjściowych"},
    {number:"03",label:"Etap trzeci",title:"Układ funkcjonalny",description:"Tworzymy warianty komunikacji, przechowywania i wyposażenia dopasowane do codziennego użytkowania.",result:"przestrzeń, która naprawdę działa"},
    {number:"04",label:"Etap czwarty",title:"Projekt koncepcyjny",description:"Łączymy światło, kolor, materiały i wyposażenie w jeden spójny kierunek wnętrza.",result:"czytelna wizja całego projektu"},
    {number:"05",label:"Etap piąty",title:"Projekt wykonawczy",description:"Przekładamy koncepcję na rysunki, zestawienia i informacje potrzebne wykonawcom.",result:"dokumentacja gotowa do realizacji"},
    {number:"06",label:"Etap szósty",title:"Nadzór autorski",description:"Konsultujemy zmiany, odpowiadamy na pytania wykonawców i pilnujemy zgodności z przyjętym kierunkiem.",result:"spójna i świadomie prowadzona realizacja"}
  ];
  const orbitNumber = document.querySelector("[data-orbit-number]");
  const orbitLabel = document.querySelector("[data-orbit-label]");
  const orbitTitle = document.querySelector("[data-orbit-title]");
  const orbitDescription = document.querySelector("[data-orbit-description]");
  const orbitResult = document.querySelector("[data-orbit-result]");
  const orbitDetail = document.querySelector("[data-orbit-detail]");
  const renderOrbit = index => {
    const data = orbitData[index];
    if (!data) return;
    orbitNodes.forEach((node,nodeIndex) => node.classList.toggle("is-active", nodeIndex === index));
    orbitDetail?.animate([{opacity:.25,transform:"translate(-50%,-50%) scale(.96)"},{opacity:1,transform:"translate(-50%,-50%) scale(1)"}],{duration:380,easing:"cubic-bezier(.2,.8,.2,1)"});
    orbitNumber.textContent = data.number;
    orbitLabel.textContent = data.label;
    orbitTitle.textContent = data.title;
    orbitDescription.textContent = data.description;
    orbitResult.textContent = data.result;
  };
  orbitNodes.forEach((node,index) => node.addEventListener("click", () => renderOrbit(index)));

  window.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      closeLightbox();
      setMenu(false);
    }
  });
})();
