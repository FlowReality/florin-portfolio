import gsap from "gsap";

const cursor = document.querySelector<HTMLElement>(".cursor");

if (cursor && window.matchMedia("(pointer: fine)").matches) {
	gsap.set(cursor, {
		xPercent: -50,
		yPercent: -50,
	});

	const moveX = gsap.quickTo(cursor, "x", {
		duration: 0.25,
		ease: "power3.out",
	});

	const moveY = gsap.quickTo(cursor, "y", {
		duration: 0.25,
		ease: "power3.out",
	});

	window.addEventListener("mousemove", (event) => {
		moveX(event.clientX);
		moveY(event.clientY);
	});

	const interactiveElements =
		document.querySelectorAll<HTMLElement>("a, button");

	interactiveElements.forEach((element) => {
		element.addEventListener("mouseenter", () => {
			cursor.classList.add("is-active");
		});

		element.addEventListener("mouseleave", () => {
			cursor.classList.remove("is-active");
		});
	});
}
