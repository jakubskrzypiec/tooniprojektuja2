(() => {
  "use strict";

  const body = document.body;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Intro integrated with the visible hero */
  const intro = document.querySelector("[data-intro]");
  const finishIntro = () => {
    if (!intro || intro.dataset.closed === "1") return;
    intro.dataset.closed = "1";
    intro.classList.add("is-leaving");
    body.classList.remove("intro-active");
    body.classList.add("intro-done");
    window.setTimeout(() => intro.remove(), 760);
  };

  if (intro && !reduceMotion) {
    window.setTimeout(finishIntro, 2500);
    intro.addEventListener("click", finishIntro, { once: true });
    window.addEventListener("keydown", event => {
      if (event.key === "Escape") finishIntro();
    });
  } else {
    intro?.remove();
    body.classList.remove("intro-active");
    body.classList.add("intro-done");
  }

  /* Header */
  const header = document.querySelector("[data-header]");
  const updateHeader = () => {
    const scrolled = window.scrollY > 36;
    header?.classList.toggle("is-scrolled", scrolled);

    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const progress = maxScroll > 0 ? (window.scrollY / maxScroll) * 100 : 0;
    document.documentElement.style.setProperty("--page-progress", `${Math.max(0, Math.min(100, progress))}%`);
  };
  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });
  window.addEventListener("resize", updateHeader);

  /* Mobile menu */
  const menuButton = document.querySelector("[data-menu-button]");
  const mobilePanel = document.querySelector("[data-mobile-panel]");

  const setMenu = open => {
    if (!menuButton || !mobilePanel) return;
    menuButton.classList.toggle("is-open", open);
    mobilePanel.classList.toggle("is-open", open);
    header?.classList.toggle("menu-visible", open);
    menuButton.setAttribute("aria-expanded", String(open));
    mobilePanel.setAttribute("aria-hidden", String(!open));
    body.classList.toggle("menu-open", open);
  };

  menuButton?.addEventListener("click", () => {
    setMenu(!menuButton.classList.contains("is-open"));
  });

  mobilePanel?.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => setMenu(false));
  });

  /* Rotating hero word */
  const rotatingWord = document.querySelector("[data-rotating-word]");
  const words = ["zostają.", "pracują.", "dojrzewają.", "działają."];
  let wordIndex = 0;

  if (rotatingWord && !reduceMotion) {
    window.setInterval(() => {
      rotatingWord.classList.add("is-changing");
      window.setTimeout(() => {
        wordIndex = (wordIndex + 1) % words.length;
        rotatingWord.textContent = words[wordIndex];
        rotatingWord.classList.remove("is-changing");
      }, 230);
    }, 2850);
  }

  /* Reveal on scroll */
  const reveals = document.querySelectorAll(".reveal");
  if (!reduceMotion && "IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: .16 });

    reveals.forEach(element => revealObserver.observe(element));
  } else {
    reveals.forEach(element => element.classList.add("is-visible"));
  }

  /* Active navigation */
  const navLinks = [...document.querySelectorAll('.desktop-nav a[href^="#"]')];
  const navSections = navLinks
    .map(link => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  if ("IntersectionObserver" in window) {
    const navObserver = new IntersectionObserver(entries => {
      const activeEntry = entries
        .filter(entry => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (!activeEntry) return;
      navLinks.forEach(link => {
        link.classList.toggle("is-active", link.getAttribute("href") === `#${activeEntry.target.id}`);
      });
    }, {
      rootMargin: "-25% 0px -58% 0px",
      threshold: [0.08, 0.25, 0.5]
    });

    navSections.forEach(section => navObserver.observe(section));
  }

  /* Project showcase */
  const showcase = document.querySelector("[data-project-showcase]");
  const slides = [...document.querySelectorAll("[data-project-slide]")];
  const prevProject = document.querySelector("[data-project-prev]");
  const nextProject = document.querySelector("[data-project-next]");
  const previewImage = document.querySelector("[data-project-preview-image]");
  const previewTitle = document.querySelector("[data-project-preview-title]");
  const currentCounter = document.querySelector("[data-project-current]");
  const progressBar = document.querySelector("[data-project-progress-bar]");
  let projectIndex = 0;
  let projectTimer = null;
  let projectProgressTimer = null;
  const projectDelay = 5800;

  const formatIndex = number => String(number + 1).padStart(2, "0");

  const updateProjectPreview = () => {
    if (!slides.length) return;
    const nextIndex = (projectIndex + 1) % slides.length;
    const nextSlide = slides[nextIndex];
    if (previewImage) previewImage.src = nextSlide.dataset.image || "";
    if (previewTitle) previewTitle.textContent = nextSlide.dataset.title || "";
    if (currentCounter) currentCounter.textContent = formatIndex(projectIndex);
  };

  const restartProjectProgress = () => {
    if (!progressBar) return;
    progressBar.style.transition = "none";
    progressBar.style.width = "0";
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        progressBar.style.transition = `width ${projectDelay}ms linear`;
        progressBar.style.width = "100%";
      });
    });
  };

  const showProject = nextIndex => {
    if (!slides.length || nextIndex === projectIndex) return;
    const currentSlide = slides[projectIndex];
    const nextSlide = slides[(nextIndex + slides.length) % slides.length];

    currentSlide.classList.remove("is-active");
    currentSlide.classList.add("is-leaving");

    nextSlide.classList.remove("is-leaving");
    nextSlide.classList.add("is-active");

    window.setTimeout(() => currentSlide.classList.remove("is-leaving"), 900);
    projectIndex = (nextIndex + slides.length) % slides.length;
    updateProjectPreview();
    restartProjectProgress();
  };

  const nextSlide = () => showProject(projectIndex + 1);
  const prevSlide = () => showProject(projectIndex - 1);

  const startProjectAuto = () => {
    if (reduceMotion || slides.length < 2) return;
    window.clearInterval(projectTimer);
    projectTimer = window.setInterval(nextSlide, projectDelay);
    restartProjectProgress();
  };

  const stopProjectAuto = () => {
    window.clearInterval(projectTimer);
    if (progressBar) {
      const currentWidth = getComputedStyle(progressBar).width;
      progressBar.style.transition = "none";
      progressBar.style.width = currentWidth;
    }
  };

  updateProjectPreview();
  startProjectAuto();

  prevProject?.addEventListener("click", () => {
    prevSlide();
    startProjectAuto();
  });

  nextProject?.addEventListener("click", () => {
    nextSlide();
    startProjectAuto();
  });

  showcase?.addEventListener("mouseenter", stopProjectAuto);
  showcase?.addEventListener("mouseleave", startProjectAuto);
  showcase?.addEventListener("focusin", stopProjectAuto);
  showcase?.addEventListener("focusout", startProjectAuto);

  let dragStartX = null;
  showcase?.addEventListener("pointerdown", event => {
    dragStartX = event.clientX;
    showcase.setPointerCapture?.(event.pointerId);
    stopProjectAuto();
  });

  showcase?.addEventListener("pointerup", event => {
    if (dragStartX === null) return;
    const distance = event.clientX - dragStartX;
    if (Math.abs(distance) > 55) {
      distance < 0 ? nextSlide() : prevSlide();
    }
    dragStartX = null;
    startProjectAuto();
  });

  /* Project modal */
  const modal = document.querySelector("[data-project-modal]");
  const modalImage = document.querySelector("[data-modal-image]");
  const modalTitle = document.querySelector("[data-modal-title]");
  const modalCategory = document.querySelector("[data-modal-category]");
  const modalPlace = document.querySelector("[data-modal-place]");
  const modalArea = document.querySelector("[data-modal-area]");
  const modalClose = document.querySelector("[data-modal-close]");

  const closeModal = () => {
    if (!modal) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    body.classList.remove("modal-open");
  };

  slides.forEach(slide => {
    slide.querySelector("button")?.addEventListener("click", () => {
      if (!modal) return;
      modalImage.src = slide.dataset.image || "";
      modalImage.alt = slide.dataset.title || "";
      modalTitle.textContent = slide.dataset.title || "";
      modalCategory.textContent = slide.dataset.category || "";
      modalPlace.textContent = slide.dataset.place || "";
      modalArea.textContent = slide.dataset.area || "";
      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
      body.classList.add("modal-open");
    });
  });

  modalClose?.addEventListener("click", closeModal);
  modal?.addEventListener("click", event => {
    if (event.target === modal) closeModal();
  });
  window.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      closeModal();
      setMenu(false);
    }
  });

  /* Interactive scope background */
  const scopeRows = [...document.querySelectorAll("[data-scope-row]")];
  const scopeImage = document.querySelector("[data-scope-image]");

  const activateScope = row => {
    if (!row || !scopeImage) return;
    scopeRows.forEach(item => item.classList.toggle("is-active", item === row));
    const nextImage = row.dataset.image;
    if (!nextImage || scopeImage.getAttribute("src") === nextImage) return;

    scopeImage.classList.add("is-changing");
    window.setTimeout(() => {
      scopeImage.src = nextImage;
      scopeImage.classList.remove("is-changing");
    }, 240);
  };

  scopeRows.forEach(row => {
    row.addEventListener("mouseenter", () => activateScope(row));
    row.addEventListener("focus", () => activateScope(row));
    row.addEventListener("click", () => activateScope(row));
  });

  /* Process tabs */
  const processTabs = [...document.querySelectorAll("[data-process-tab]")];
  const processData = [
    {
      number: "01",
      label: "Etap pierwszy",
      title: "Analiza lokalu",
      description: "Poznajemy sposób użytkowania, możliwości lokalu i ograniczenia techniczne. Rozmowa porządkuje potrzeby i ustala kierunek kolejnych decyzji.",
      during: "rozmowa / analiza potrzeb / oględziny",
      result: "jasny kierunek dalszej pracy"
    },
    {
      number: "02",
      label: "Etap drugi",
      title: "Inwentaryzacja",
      description: "Dokładnie mierzymy przestrzeń, fotografujemy stan istniejący i porządkujemy materiał, który będzie podstawą kolejnych etapów.",
      during: "pomiary / dokumentacja fotograficzna / analiza techniczna",
      result: "komplet danych wyjściowych"
    },
    {
      number: "03",
      label: "Etap trzeci",
      title: "Układ funkcjonalny",
      description: "Przygotowujemy warianty układu i wybieramy rozwiązanie najlepiej dopasowane do komunikacji, ergonomii i codziennego użytkowania.",
      during: "warianty / komunikacja / wyposażenie",
      result: "przestrzeń, która naprawdę działa"
    },
    {
      number: "04",
      label: "Etap czwarty",
      title: "Projekt koncepcyjny",
      description: "Łączymy kolorystykę, światło, materiały i wyposażenie w jeden konsekwentny kierunek. Koncepcja porządkuje atmosferę całego wnętrza.",
      during: "materiały / światło / wizualizacje",
      result: "spójna wizja wnętrza"
    },
    {
      number: "05",
      label: "Etap piąty",
      title: "Projekt wykonawczy",
      description: "Przekładamy zaakceptowaną koncepcję na rysunki, zestawienia i informacje potrzebne wykonawcom podczas realizacji.",
      during: "rysunki / zestawienia / wytyczne",
      result: "projekt gotowy do realizacji"
    },
    {
      number: "06",
      label: "Etap szósty",
      title: "Nadzór autorski",
      description: "Konsultujemy zmiany, odpowiadamy na pytania wykonawców i pilnujemy, aby realizacja pozostała zgodna z przyjętym kierunkiem.",
      during: "wizyty / konsultacje / kontrola zgodności",
      result: "świadomie prowadzona realizacja"
    }
  ];

  const detail = document.querySelector("[data-process-detail]");
  const processNumber = document.querySelector("[data-process-number]");
  const processLabel = document.querySelector("[data-process-label]");
  const processTitle = document.querySelector("[data-process-title]");
  const processDescription = document.querySelector("[data-process-description]");
  const processDuring = document.querySelector("[data-process-during]");
  const processResult = document.querySelector("[data-process-result]");

  const renderProcess = index => {
    const data = processData[index];
    if (!data || !detail) return;

    processTabs.forEach((tab, tabIndex) => {
      const active = tabIndex === index;
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-selected", String(active));
    });

    detail.animate(
      [
        { opacity: .25, transform: "translateY(10px)" },
        { opacity: 1, transform: "translateY(0)" }
      ],
      { duration: 360, easing: "cubic-bezier(.2,.8,.2,1)" }
    );

    processNumber.textContent = data.number;
    processLabel.textContent = data.label;
    processTitle.textContent = data.title;
    processDescription.textContent = data.description;
    processDuring.textContent = data.during;
    processResult.textContent = data.result;
  };

  processTabs.forEach((tab, index) => {
    tab.addEventListener("click", () => renderProcess(index));
  });

  /* Three-step form */
  const form = document.querySelector("[data-project-form]");
  const formSteps = [...document.querySelectorAll("[data-form-step]")];
  const formDots = [...document.querySelectorAll("[data-form-dot]")];
  let formStepIndex = 0;

  const showFormStep = index => {
    formStepIndex = Math.max(0, Math.min(formSteps.length - 1, index));
    formSteps.forEach((step, stepIndex) => {
      step.classList.toggle("is-active", stepIndex === formStepIndex);
    });
    formDots.forEach((dot, dotIndex) => {
      dot.classList.toggle("is-active", dotIndex === formStepIndex);
    });
  };

  const validateCurrentStep = () => {
    const fields = [...formSteps[formStepIndex].querySelectorAll("input, select, textarea")];
    return fields.every(field => {
      if (!field.checkValidity()) {
        field.reportValidity();
        return false;
      }
      return true;
    });
  };

  form?.querySelectorAll("[data-form-next]").forEach(button => {
    button.addEventListener("click", () => {
      if (validateCurrentStep()) showFormStep(formStepIndex + 1);
    });
  });

  form?.querySelectorAll("[data-form-back]").forEach(button => {
    button.addEventListener("click", () => showFormStep(formStepIndex - 1));
  });

  formDots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      if (index <= formStepIndex || validateCurrentStep()) showFormStep(index);
    });
  });

  const params = new URLSearchParams(window.location.search);
  if (params.get("wyslano") === "1") {
    const success = document.querySelector("[data-form-success]");
    success?.classList.add("is-visible");
    showFormStep(2);
  }
})();
