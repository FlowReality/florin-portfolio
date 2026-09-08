import gsap from "gsap";

const cursor = document.querySelector<HTMLElement>(".cursor");
const codeHoverElements =
	document.querySelectorAll<HTMLElement>(".js-code-hover");
const trailHoverElements =
	document.querySelectorAll<HTMLElement>(".js-trail-hover");
const mailHoverElements =
	document.querySelectorAll<HTMLElement>(".js-mail-hover");

if (cursor && window.matchMedia("(pointer: fine)").matches) {
	gsap.set(cursor, {
		xPercent: -50,
		yPercent: -50,
	});

	const moveX = gsap.quickTo(cursor, "x", {
		duration: 0.22,
		ease: "power3.out",
	});

	const moveY = gsap.quickTo(cursor, "y", {
		duration: 0.22,
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

	codeHoverElements.forEach((element) => {
		element.addEventListener("mouseenter", () => {
			cursor.classList.add("is-code");
		});

		element.addEventListener("mouseleave", () => {
			cursor.classList.remove("is-code");
		});
	});

	let trailActive = false;
	let lastTrailTime = 0;

	trailHoverElements.forEach((element) => {
		element.addEventListener("mouseenter", () => {
			trailActive = true;
			cursor.classList.add("is-trail");
		});

		element.addEventListener("mouseleave", () => {
			trailActive = false;
			cursor.classList.remove("is-trail");
		});
	});

	const canvas =
		document.querySelector<HTMLCanvasElement>(".cursor-trail-canvas");

	const ctx = canvas?.getContext("2d");

	type TrailPoint = {
		x: number;
		y: number;
		life: number;
	};

	const trailPoints: TrailPoint[] = [];

	let mouseX = 0;
	let mouseY = 0;

	let smoothX = 0;
	let smoothY = 0;

	const resizeCanvas = () => {
		if (!canvas) return;

		const dpr = Math.min(window.devicePixelRatio || 1, 2);

		canvas.width = window.innerWidth * dpr;
		canvas.height = window.innerHeight * dpr;

		canvas.style.width = `${window.innerWidth}px`;
		canvas.style.height = `${window.innerHeight}px`;

		if (ctx) {
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		}
	};

	resizeCanvas();

	window.addEventListener("resize", resizeCanvas);

	window.addEventListener("mousemove", (event) => {
		mouseX = event.clientX;
		mouseY = event.clientY;

		if (!trailActive) {
			smoothX = mouseX;
			smoothY = mouseY;
		}
	});

	const drawTrail = () => {
		requestAnimationFrame(drawTrail);

		if (!ctx || !canvas) return;

		ctx.clearRect(
			0,
			0,
			window.innerWidth,
			window.innerHeight,
		);

		if (!trailActive) {
			trailPoints.length = 0;
			return;
		}

		/*
		 * Più basso = più morbido e "liquido".
		 * 0.16 è abbastanza fluido senza staccarsi troppo dal mouse.
		 */
		smoothX += (mouseX - smoothX) * 0.16;
		smoothY += (mouseY - smoothY) * 0.16;

		trailPoints.push({
			x: smoothX,
			y: smoothY,
			life: 1,
		});

		/*
		 * Lunghezza della coda.
		 */
		if (trailPoints.length > 32) {
			trailPoints.shift();
		}

		trailPoints.forEach((point) => {
			point.life -= 0.025;
		});

		while (
			trailPoints.length > 0 &&
			trailPoints[0].life <= 0
		) {
			trailPoints.shift();
		}

		if (trailPoints.length < 3) return;

		ctx.lineCap = "round";
		ctx.lineJoin = "round";

		for (let i = 1; i < trailPoints.length - 1; i++) {
			const previous = trailPoints[i - 1];
			const current = trailPoints[i];
			const next = trailPoints[i + 1];

			const startX = (previous.x + current.x) / 2;
			const startY = (previous.y + current.y) / 2;

			const endX = (current.x + next.x) / 2;
			const endY = (current.y + next.y) / 2;

			const progress = i / trailPoints.length;

			const alpha =
				0.04 + progress * 0.34;

			const red = Math.round(
				150 + progress * 95,
			);

			const green = Math.round(
				165 + progress * 80,
			);

			const blue = 255;

			const color =
				`rgba(${red}, ${green}, ${blue}, ${alpha})`;

			ctx.beginPath();

			ctx.moveTo(startX, startY);

			/*
			 * quadraticCurveTo è ciò che elimina gli angoli:
			 * ogni segmento viene raccordato con una curva.
			 */
			ctx.quadraticCurveTo(
				current.x,
				current.y,
				endX,
				endY,
			);

			ctx.strokeStyle = color;

			// La coda è sottile, vicino al mouse diventa più larga.
			const headWidth = 72;
			const tailWidth = 2;

			ctx.lineWidth =
				tailWidth +
				(headWidth - tailWidth) *
				Math.pow(progress, 2.2);

			ctx.shadowColor =
				`rgba(165, 175, 255, ${alpha})`;

			ctx.shadowBlur =
				4 + progress * 10;

			ctx.stroke();
		}

		ctx.shadowBlur = 0;
	};

	drawTrail();

	mailHoverElements.forEach((element) => {
		element.addEventListener("mouseenter", () => {
			cursor.classList.add("is-mail");
		});

		element.addEventListener("mouseleave", () => {
			cursor.classList.remove("is-mail");
		});
	});
}
