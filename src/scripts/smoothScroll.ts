import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const lenis = new Lenis({
  duration: 1.1,
  smoothWheel: true,
  wheelMultiplier: 0.9,
});

lenis.on("scroll", ScrollTrigger.update);

const navbar = document.querySelector(".navbar");

let navbarHidden = false;

lenis.on("scroll", ({ scroll, direction }) => {
  if (!navbar) return;

  if (direction === 1 && scroll > 120 && !navbarHidden) {
    navbarHidden = true;

    gsap.to(navbar, {
      yPercent: -120,
      duration: 0.45,
      ease: "power3.out",
    });
  }

  if (direction === -1 && navbarHidden) {
    navbarHidden = false;

    gsap.to(navbar, {
      yPercent: 0,
      duration: 0.45,
      ease: "power3.out",
    });
  }

  if (scroll < 50 && navbarHidden) {
    navbarHidden = false;

    gsap.to(navbar, {
      yPercent: 0,
      duration: 0.45,
      ease: "power3.out",
    });
  }
});

const anchorLinks = document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]');

anchorLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    const href = link.getAttribute("href");

    if (!href) return;

    if (href === "#") {
      event.preventDefault();

      lenis.scrollTo(0, {
        duration: 1.1,
      });

      return;
    }

    const target = document.querySelector<HTMLElement>(href);

    if (!target) return;

    event.preventDefault();

    lenis.scrollTo(target, {
      offset: 0,
      duration: 1.1,
    });
  });
});

gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});

gsap.ticker.lagSmoothing(0);

export default lenis;
