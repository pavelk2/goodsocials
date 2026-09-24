/**
 * One burst of confetti for the moment the first post lands. The pieces are
 * the dots of the streak grid, in the three colours the mark is drawn in, so
 * the celebration is the logo coming apart rather than a party kit.
 *
 * The canvas hangs off document.body, not the React tree, so it keeps falling
 * over the post after the waiting screen unmounts, and removes itself when
 * the last piece leaves the screen. Nothing runs under reduced motion.
 */
export function burstConfetti(): void {
  if (typeof window === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const css = getComputedStyle(document.documentElement);
  const colors = ["--accent-text", "--accent-text", "--ink", "--ink-3"].map((name) =>
    css.getPropertyValue(name).trim(),
  );

  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  canvas.style.cssText = "position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:60";
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    canvas.remove();
    return;
  }

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const width = window.innerWidth;
  const height = window.innerHeight;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.scale(dpr, dpr);

  // Two cannons from the lower corners, aimed up and in.
  const pieces = Array.from({ length: 160 }, (_, i) => {
    const left = i % 2 === 0;
    const angle = (left ? -60 : -120) * (Math.PI / 180) + (Math.random() - 0.5) * 0.7;
    const speed = 11 + Math.random() * 9;
    return {
      x: left ? 0 : width,
      y: height * 0.85,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      r: 3 + Math.random() * 3,
      square: Math.random() < 0.35,
      spin: Math.random() * Math.PI,
      spinV: (Math.random() - 0.5) * 0.3,
      color: colors[i % colors.length] || "currentColor",
    };
  });

  let last = performance.now();
  const frame = (now: number) => {
    const dt = Math.min((now - last) / 16.67, 3);
    last = now;
    ctx.clearRect(0, 0, width, height);
    let alive = 0;
    for (const p of pieces) {
      p.vx *= Math.pow(0.985, dt);
      p.vy = p.vy * Math.pow(0.985, dt) + 0.32 * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.spin += p.spinV * dt;
      if (p.y - p.r > height) continue;
      alive++;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      if (p.square) {
        // A flat dot turning over reads as a flake rather than a circle.
        const w = p.r * 2 * Math.abs(Math.cos(p.spin));
        ctx.rect(p.x - w / 2, p.y - p.r, Math.max(w, 0.8), p.r * 2);
      } else {
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      }
      ctx.fill();
    }
    if (alive > 0) requestAnimationFrame(frame);
    else canvas.remove();
  };
  requestAnimationFrame(frame);
}
