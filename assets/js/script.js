'use strict';

/* ================= PRELOADER ================= */

const preloader = document.querySelector("[data-preaload]");

if (preloader) {
  window.addEventListener("load", () => {
    preloader.classList.add("loaded");
    document.body.classList.add("loaded");
  });
}

/* ================= HELPER ================= */

const addEventOnElements = (elements, eventType, callback) => {
  if (!elements) return;
  elements.forEach(el => {
    if (el) el.addEventListener(eventType, callback);
  });
};

/* ================= NAVBAR ================= */

const navbar = document.querySelector("[data-navbar]");
const navTogglers = document.querySelectorAll("[data-nav-toggler]");
const overlay = document.querySelector("[data-overlay]");

if (navbar && overlay && navTogglers.length > 0) {

  const toggleNavbar = () => {
    navbar.classList.toggle("active");
    overlay.classList.toggle("active");
    document.body.classList.toggle("nav-active");
  };

  addEventOnElements(navTogglers, "click", toggleNavbar);
}

/* ================= HEADER (SCROLL EFFECT) ================= */

const header = document.querySelector("[data-header]");
const backTopBtn = document.querySelector("[data-back-top-btn]");

if (header) {

  let lastScrollPos = 0;

  const hideHeader = () => {
    const isScrollingDown = window.scrollY > lastScrollPos;

    if (isScrollingDown) {
      header.classList.add("hide");
    } else {
      header.classList.remove("hide");
    }

    lastScrollPos = window.scrollY;
  };

  window.addEventListener("scroll", () => {

    if (window.scrollY >= 50) {
      header.classList.add("active");

      if (backTopBtn) {
        backTopBtn.classList.add("active");
      }

      hideHeader();

    } else {
      header.classList.remove("active");

      if (backTopBtn) {
        backTopBtn.classList.remove("active");
      }
    }

  });
}

/* ================= HERO SLIDER ================= */

const heroSlider = document.querySelector("[data-hero-slider]");
const heroSliderItems = document.querySelectorAll("[data-hero-slider-item]");
const prevBtn = document.querySelector("[data-prev-btn]");
const nextBtn = document.querySelector("[data-next-btn]");

if (heroSlider && heroSliderItems.length > 0 && prevBtn && nextBtn) {

  let currentSlide = 0;
  let lastActive = heroSliderItems[0];

  const updateSlider = () => {
    lastActive.classList.remove("active");
    heroSliderItems[currentSlide].classList.add("active");
    lastActive = heroSliderItems[currentSlide];
  };

  const nextSlide = () => {
    currentSlide = (currentSlide + 1) % heroSliderItems.length;
    updateSlider();
  };

  const prevSlide = () => {
    currentSlide = (currentSlide - 1 + heroSliderItems.length) % heroSliderItems.length;
    updateSlider();
  };

  nextBtn.addEventListener("click", nextSlide);
  prevBtn.addEventListener("click", prevSlide);

  /* AUTO SLIDE */
  let autoSlideInterval;

  const startAutoSlide = () => {
    autoSlideInterval = setInterval(nextSlide, 7000);
  };

  const stopAutoSlide = () => {
    clearInterval(autoSlideInterval);
  };

  addEventOnElements([nextBtn, prevBtn], "mouseover", stopAutoSlide);
  addEventOnElements([nextBtn, prevBtn], "mouseout", startAutoSlide);

  window.addEventListener("load", startAutoSlide);
}

/* ================= PARALLAX ================= */

const parallaxItems = document.querySelectorAll("[data-parallax-item]");

if (parallaxItems.length > 0) {

  window.addEventListener("mousemove", (event) => {

    let x = (event.clientX / window.innerWidth * 10) - 5;
    let y = (event.clientY / window.innerHeight * 10) - 5;

    x *= -1;
    y *= -1;

    parallaxItems.forEach(item => {
      const speed = item.dataset.parallaxSpeed || 1;
      item.style.transform = `translate3d(${x * speed}px, ${y * speed}px, 0px)`;
    });

  });
}