import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

ScrollTrigger.config({
  limitCallbacks: true,
});

const lenis = new Lenis({
  duration: prefersReducedMotion ? 0 : 1.1,
  smoothWheel: !prefersReducedMotion,
  wheelMultiplier: 0.9,
});

lenis.on("scroll", ScrollTrigger.update);

/* =========================
   NAVBAR
   ========================= */

const navbar = document.querySelector<HTMLElement>(".navbar");

let navbarHidden = false;

const setNavbarVisibility = (hidden: boolean) => {
  if (!navbar || navbarHidden === hidden) return;

  navbarHidden = hidden;

  gsap.killTweensOf(navbar);

  if (prefersReducedMotion) {
    gsap.set(navbar, {
      yPercent: hidden ? -120 : 0,
    });

    return;
  }

  gsap.to(navbar, {
    yPercent: hidden ? -120 : 0,
    duration: 0.45,
    ease: "power3.out",
    overwrite: true,
  });
};

lenis.on("scroll", ({ scroll, direction }) => {
  if (!navbar) return;

  if (scroll < 50) {
    setNavbarVisibility(false);
    return;
  }

  if (direction === 1 && scroll > 120) {
    setNavbarVisibility(true);
    return;
  }

  if (direction === -1) {
    setNavbarVisibility(false);
  }
});

/* =========================
   ANCHOR LINKS
   ========================= */

const anchorLinks =
  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]');

anchorLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    const href = link.getAttribute("href");

    if (!href) return;

    if (href === "#") {
      event.preventDefault();

      lenis.scrollTo(0, {
        duration: prefersReducedMotion ? 0 : 1.1,
      });

      return;
    }

    const id = href.slice(1);

    if (!id) return;

    const target = document.getElementById(id);

    if (!target) return;

    event.preventDefault();

    lenis.scrollTo(target, {
      offset: 0,
      duration: prefersReducedMotion ? 0 : 1.1,
    });
  });
});

/* =========================
   GSAP TICKER
   ========================= */

gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});

gsap.ticker.lagSmoothing(0);

/* =========================
   SCROLLTRIGGER REFRESH
   ========================= */

const refreshScrollTrigger = () => {
  requestAnimationFrame(() => {
    ScrollTrigger.refresh();
  });
};

window.addEventListener("load", refreshScrollTrigger);

if (document.fonts) {
  document.fonts.ready.then(refreshScrollTrigger);
}

/*
 * Refresh solo quando cambia realmente la larghezza.
 * Le variazioni verticali della viewport mobile vengono ignorate.
 */
let previousWidth = window.innerWidth;
let resizeFrame: number | null = null;

window.addEventListener("resize", () => {
  const currentWidth = window.innerWidth;

  if (currentWidth === previousWidth) return;

  previousWidth = currentWidth;

  if (resizeFrame !== null) {
    cancelAnimationFrame(resizeFrame);
  }

  resizeFrame = requestAnimationFrame(() => {
    ScrollTrigger.refresh();
    resizeFrame = null;
  });
});

export default lenis;
