// Tiny dependency-free canvas charts with smooth eased animation.
const ease = (t) => 1 - Math.pow(1 - t, 3);
const cssVar = (n, fb) => getComputedStyle(document.documentElement).getPropertyValue(n).trim() || fb;

function setup(canvas) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const r = canvas.getBoundingClientRect();
  const w = Math.max(1, r.width);
  const h = Math.max(1, r.height);
  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, w, h };
}

// Runs draw(progress) from 0->1 with rAF. Returns a cancel function.
function animate(draw, dur = 650) {
  let raf = 0;
  const start = performance.now();
  const frame = (now) => {
    const p = Math.min(1, (now - start) / dur);
    draw(ease(p));
    if (p < 1) raf = requestAnimationFrame(frame);
  };
  raf = requestAnimationFrame(frame);
  return () => cancelAnimationFrame(raf);
}

function roundRect(ctx, x, y, w, h, r) {
  r = Math.min(r, w / 2, Math.max(h, 0) / 2);
  ctx.beginPath();
  if (h <= 0 || w <= 0) return;
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x, y + h);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function drawBars(canvas, labels, series, colors) {
  const { ctx, w, h } = setup(canvas);
  const max = Math.max(1, ...series.flat());
  const pad = { t: 14, r: 8, b: 26, l: 8 };
  const cw = w - pad.l - pad.r;
  const ch = h - pad.t - pad.b;
  const grp = cw / labels.length;
  const bw = Math.max(6, Math.min(18, grp * 0.28));
  const muted = cssVar('--muted', '#999');
  const line = cssVar('--line', '#333');

  return animate((p) => {
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = line;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i <= 3; i++) {
      const y = pad.t + (ch * i) / 3 + 0.5;
      ctx.moveTo(pad.l, y);
      ctx.lineTo(w - pad.r, y);
    }
    ctx.stroke();
    labels.forEach((lab, i) => {
      const x0 = pad.l + grp * i + grp / 2;
      series.forEach((s, j) => {
        const v = s[i] || 0;
        const bh = ch * (v / max) * p;
        const x = x0 + (j - (series.length - 1) / 2) * (bw + 4) - bw / 2;
        ctx.fillStyle = colors[j];
        roundRect(ctx, x, pad.t + ch - bh, bw, bh, 6);
        ctx.fill();
      });
      ctx.fillStyle = muted;
      ctx.font = '12px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(lab, x0, h - 8);
    });
  });
}

// slices: [{ label, value, color }]
export function drawDonut(canvas, slices) {
  const { ctx, w, h } = setup(canvas);
  const total = slices.reduce((a, s) => a + s.value, 0);
  const cx = w / 2;
  const cy = h / 2;
  const r = Math.min(w, h) / 2 - 6;
  const inner = r * 0.64;
  const line = cssVar('--line', '#333');

  return animate((p) => {
    ctx.clearRect(0, 0, w, h);
    if (!total) {
      ctx.strokeStyle = line;
      ctx.lineWidth = r - inner;
      ctx.beginPath();
      ctx.arc(cx, cy, (r + inner) / 2, 0, Math.PI * 2);
      ctx.stroke();
      return;
    }
    let a = -Math.PI / 2;
    const end = a + Math.PI * 2 * p;
    for (const s of slices) {
      const a2 = a + (s.value / total) * Math.PI * 2;
      if (a >= end) break;
      const stop = Math.min(a2, end);
      ctx.beginPath();
      ctx.arc(cx, cy, r, a, stop);
      ctx.arc(cx, cy, inner, stop, a, true);
      ctx.closePath();
      ctx.fillStyle = s.color;
      ctx.fill();
      a = a2;
    }
  });
}
