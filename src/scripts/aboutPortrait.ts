const portrait = document.querySelector<HTMLElement>(".about-portrait");
const photo = portrait?.querySelector("img");
const canvas = portrait?.querySelector("canvas");
const context = canvas?.getContext("2d");
const motion = window.matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");

if (portrait && photo && canvas && context) {
  const cursor = document.querySelector<HTMLElement>(".cursor");
  let frame = 0;
  let active = false;
  let width = 0;
  let height = 0;
  let x = 0;
  let y = 0;
  let clientX = 0;
  let clientY = 0;
  let reveal = 0;
  let lastTime = 0;
  let stretchX = 0;
  let stretchY = 0;

  const resize = () => {
    width = portrait.clientWidth;
    height = portrait.clientHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  new ResizeObserver(resize).observe(portrait);

  const leave = () => {
    active = false;
    portrait.classList.remove("is-mercury");
    cursor?.classList.remove("is-mercury");
  };

  const draw = (time: number) => {
    const dt = Math.min((time - lastTime) / 16.67 || 1, 3);
    lastTime = time;
    const bounds = portrait.getBoundingClientRect();
    const targetX = clientX - bounds.left;
    const targetY = clientY - bounds.top;
    if (active && (targetX < 0 || targetX > width || targetY < 0 || targetY > height)) leave();
    const dx = targetX - x;
    const dy = targetY - y;
    const follow = 1 - Math.pow(0.8, dt);
    x += dx * follow;
    y += dy * follow;
    reveal += ((active ? 1 : 0) - reveal) * (1 - Math.pow(0.78, dt));
    context.clearRect(0, 0, width, height);

    stretchX += (dx - stretchX) * follow;
    stretchY += (dy - stretchY) * follow;
    if (reveal > 0.005 && photo.complete && photo.naturalWidth) {
      const radius = Math.min(104, width * 0.26) * (0.85 + reveal * 0.15);
      const speed = Math.hypot(stretchX, stretchY);
      const stretch = Math.min(speed / 220, 0.22);
      const direction = Math.atan2(stretchY, stretchX);
      const blob = new Path2D();
      for (let i = 0; i <= 96; i++) {
        const angle = i / 96 * Math.PI * 2;
        const ripple = 1 + 0.045 * Math.sin(angle * 3 + time * 0.0011)
          + 0.025 * Math.cos(angle * 5 - time * 0.0008);
        const deformation = 1 + stretch * Math.cos(2 * (angle - direction));
        const r = radius * ripple * deformation;
        const px = x + Math.cos(angle) * r;
        const py = y + Math.sin(angle) * r;
        if (i === 0) blob.moveTo(px, py);
        else blob.lineTo(px, py);
      }
      blob.closePath();

      // Feather only the mask, keeping the revealed photograph sharp.
      context.save();
      context.globalAlpha = reveal;
      context.filter = 'blur(5px)';
      context.fillStyle = '#fff';
      context.fill(blob);
      context.restore();
      context.save();
      context.globalCompositeOperation = 'source-in';
      const scale = Math.max(width / photo.naturalWidth, height / photo.naturalHeight);
      const dw = photo.naturalWidth * scale;
      const dh = photo.naturalHeight * scale;
      context.drawImage(photo, (width - dw) / 2, (height - dh) / 2, dw, dh);
      context.restore();

      // Subtle silver highlights suggest liquid metal without a hard outline.
      const silver = context.createLinearGradient(x - radius, y - radius, x + radius, y + radius);
      silver.addColorStop(0, 'rgba(255,255,255,0.65)');
      silver.addColorStop(0.22, 'rgba(190,202,211,0.25)');
      silver.addColorStop(0.43, 'rgba(35,45,53,0.12)');
      silver.addColorStop(0.62, 'rgba(245,248,250,0.5)');
      silver.addColorStop(0.83, 'rgba(100,115,125,0.08)');
      silver.addColorStop(1, 'rgba(225,233,239,0.4)');
      context.save();
      context.globalAlpha = reveal;
      context.strokeStyle = silver;
      context.lineWidth = 2;
      context.filter = 'blur(1.5px)';
      context.stroke(blob);
      context.filter = 'none';
      context.clip(blob);
      const sheen = context.createLinearGradient(x - radius, y - radius, x + radius, y + radius);
      sheen.addColorStop(0, 'rgba(240,247,255,0.12)');
      sheen.addColorStop(0.45, 'rgba(255,255,255,0)');
      sheen.addColorStop(1, 'rgba(30,40,50,0.04)');
      context.fillStyle = sheen;
      context.fill(blob);
      context.restore();
    }
    if (active || reveal > 0.005) frame = requestAnimationFrame(draw);
    else frame = 0;
  };

  portrait.addEventListener("pointerenter", (event) => {
    if (!motion.matches || event.pointerType === "touch") return;
    clientX = event.clientX;
    clientY = event.clientY;
    const bounds = portrait.getBoundingClientRect();
    x = clientX - bounds.left;
    y = clientY - bounds.top;
    stretchX = 0;
    stretchY = 0;
    active = true;
    portrait.classList.add("is-mercury");
    cursor?.classList.add("is-mercury");
    if (!frame) {
      lastTime = performance.now();
      frame = requestAnimationFrame(draw);
    }
  });
  portrait.addEventListener("pointermove", (event) => {
    clientX = event.clientX;
    clientY = event.clientY;
  });
  portrait.addEventListener("pointerleave", leave);
  portrait.addEventListener("pointercancel", leave);
  window.addEventListener("blur", leave);
  motion.addEventListener("change", leave);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) leave();
  });
}
