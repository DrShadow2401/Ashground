'use client';

import React, { useEffect, useRef } from 'react';

interface CellularFireProps {
  className?: string;
}

export const CellularFire: React.FC<CellularFireProps> = ({ className }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let W = window.innerWidth;
    let H = window.innerHeight;

    const initCanvas = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W;
      canvas.height = H;
    };

    initCanvas();
    window.addEventListener('resize', initCanvas);

    // --- NOISE-BASED FIRE using pixel simulation + particle layer ---

    // Cellular fire grid
    const COLS = Math.floor(W / 3);
    const ROWS = Math.floor(H / 3);
    let grid = new Float32Array(COLS * ROWS);
    let next = new Float32Array(COLS * ROWS);
    const imageData = ctx.createImageData(W, H);
    const px = imageData.data;

    // spread front
    let spreadCols = 2;
    const spreadRate = 4; // columns per frame — FAST

    // Particles for volumetric layer
    const particles: any[] = [];
    const embers: any[] = [];
    const ashes: any[] = [];
    let time = 0;

    const idx = (c: number, r: number) => r * COLS + c;

    const stepFire = () => {
      // inject heat at bottom of burned columns
      for (let c = 0; c < spreadCols && c < COLS; c++) {
        const base = ROWS - 1; // Inject at the very bottom of the grid
        for (let r = base; r < ROWS; r++) {
          grid[idx(c, r)] = 0.85 + Math.random() * 0.15;
        }
        // random hot spots mid-way to make it turbulent
        if (Math.random() < 0.3) {
          const rr = Math.floor(Math.random() * (ROWS * 0.6));
          grid[idx(c, rr)] = Math.min(grid[idx(c, rr)] + 0.4, 1.0);
        }
      }

      // propagate
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          if (c >= spreadCols) {
            next[idx(c, r)] = 0;
            continue;
          }
          const cur = grid[idx(c, r)];
          const below = r < ROWS - 1 ? grid[idx(c, r + 1)] : 1.0;
          const left = c > 0 ? grid[idx(c - 1, r)] : 0;
          const right = c < COLS - 1 ? grid[idx(c + 1, r)] : 0;

          let val = (below * 0.82 + left * 0.06 + right * 0.06 + cur * 0.06);
          val -= 0.018 + Math.random() * 0.022; // cooling
          val += (Math.random() - 0.52) * 0.06; // turbulence
          next[idx(c, r)] = Math.max(0, Math.min(1, val));
        }
      }
      grid.set(next);
    };

    const renderFire = () => {
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          const v = grid[idx(c, r)];
          // each cell = 3x3 pixels
          for (let dy = 0; dy < 3; dy++) {
            for (let dx = 0; dx < 3; dx++) {
              const px_r = r * 3 + dy, px_c = c * 3 + dx;
              if (px_r >= H || px_c >= W) continue;
              const i = (px_r * W + px_c) * 4;
              if (v <= 0) {
                px[i] = px[i + 1] = px[i + 2] = px[i + 3] = 0;
                continue;
              }
              let rr, gg, bb, aa;
              if (v > 0.85) { // white-yellow core
                rr = 255; gg = 255; bb = Math.floor(180 * (v - 0.85) / 0.15); aa = 255;
              } else if (v > 0.65) { // bright orange
                rr = 255; gg = Math.floor(200 * (v - 0.65) / 0.2 + 55); bb = 0; aa = 255;
              } else if (v > 0.42) { // orange-red
                rr = 255; gg = Math.floor(55 * (v - 0.42) / 0.23); bb = 0; aa = Math.floor(255 * ((v - 0.42) / 0.23));
              } else if (v > 0.18) { // deep red
                rr = Math.floor(200 * (v - 0.18) / 0.24 + 55); gg = 0; bb = 0; aa = Math.floor(200 * ((v - 0.18) / 0.24));
              } else { // dying ember glow
                rr = 80; gg = 0; bb = 0; aa = Math.floor(120 * (v / 0.18));
              }
              px[i] = rr; px[i + 1] = gg; px[i + 2] = bb; px[i + 3] = aa;
            }
          }
        }
      }
      ctx.putImageData(imageData, 0, 0);
    };

    // Particle embers for extra chaos
    class Ember {
      x: number; y: number; vx: number; vy: number; life: number; decay: number; size: number; wobble: number; trail: any[];
      constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 5;
        this.vy = -(Math.random() * 7 + 3);
        this.life = 1.0;
        this.decay = Math.random() * 0.01 + 0.005;
        this.size = Math.random() * 3.5 + 1;
        this.wobble = Math.random() * Math.PI * 2;
        this.trail = [];
      }
      update() {
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > 10) this.trail.shift();
        this.wobble += 0.12;
        this.vx += Math.sin(this.wobble) * 0.15;
        this.vy += 0.09;
        this.x += this.vx;
        this.y += this.vy;
        this.life -= this.decay;
        if (this.y > H - 20 && this.vy > 0) {
          ashes.push(new Ash(this.x, this.y));
          this.life = 0;
        }
      }
      draw() {
        for (let i = 0; i < this.trail.length; i++) {
          const t = this.trail[i];
          const a = (i / this.trail.length) * this.life * 0.6;
          ctx.beginPath();
          ctx.arc(t.x, t.y, this.size * (i / this.trail.length) * 0.8, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,${Math.floor(150 * this.life)},0,${a})`;
          ctx.fill();
        }
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,${Math.floor(100 * this.life)},${this.life})`;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,80,0,${this.life * 0.1})`;
        ctx.fill();
      }
    }

    class Ash {
      x: number; y: number; vx: number; vy: number; life: number; decay: number; w: number; h: number; rot: number; rotV: number; settleY: number; settled: boolean; gray: number;
      constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = -(Math.random() * 1.5);
        this.life = 1.0;
        this.decay = Math.random() * 0.003 + 0.001;
        this.w = Math.random() * 7 + 2;
        this.h = Math.random() * 2.5 + 0.5;
        this.rot = Math.random() * Math.PI * 2;
        this.rotV = (Math.random() - 0.5) * 0.06;
        this.settleY = H - 5 - Math.random() * 22;
        this.settled = false;
        this.gray = Math.floor(Math.random() * 70 + 100);
      }
      update() {
        if (!this.settled) {
          this.vx += (Math.random() - 0.5) * 0.1;
          this.vx *= 0.97;
          this.vy += 0.06;
          this.x += this.vx;
          this.y += this.vy;
          this.rot += this.rotV;
          if (this.y >= this.settleY) { this.y = this.settleY; this.settled = true; }
        }
        this.life -= this.decay;
      }
      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rot);
        ctx.fillStyle = `rgba(${this.gray},${this.gray - 15},${this.gray - 25},${Math.min(this.life * 0.9, 0.8)})`;
        ctx.fillRect(-this.w / 2, -this.h / 2, this.w, this.h);
        ctx.restore();
      }
    }

    // Volumetric fire columns — tall, dense, REAL looking
    const spawnVolumetric = () => {
      const burnedW = Math.min(spreadCols * 3, W);
      // dense spawn every few pixels along the base
      for (let x = 0; x < burnedW; x += 8) {
        const maturity = Math.min((spreadCols * 3 - x) / (W * 0.4), 1);
        if (maturity <= 0 || Math.random() > 0.7) continue;
        const flicker = 0.7 + 0.6 * Math.sin(time * 0.13 + x * 0.025);
        const intensity = maturity * flicker;
        // tall particle columns
        const numP = Math.floor(intensity * 3);
        for (let p = 0; p < numP; p++) {
          const px2 = x + (Math.random() - 0.5) * 14;
          const py = H - 45 + (Math.random() - 0.5) * 10;
          particles.push({
            x: px2, y: py,
            vx: (Math.random() - 0.5) * 1.5,
            vy: -(Math.random() * 6 + 3) * intensity,
            life: 1.0,
            decay: Math.random() * 0.02 + 0.012,
            size: Math.random() * 16 + 8,
            wobble: Math.random() * Math.PI * 2
          });
        }
        // embers
        if (Math.random() < 0.012 * intensity) {
          embers.push(new Ember(x + (Math.random() - 0.5) * 20, H - 50 - Math.random() * 60));
        }
      }
    };

    const drawParticles = () => {
      ctx.globalCompositeOperation = 'screen';
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.wobble += 0.07;
        p.x += p.vx + Math.sin(p.wobble + p.y * 0.02) * 0.7;
        p.y += p.vy;
        p.vy *= 0.984;
        p.life -= p.decay;
        p.size *= 0.992;
        if (p.life <= 0) { particles.splice(i, 1); continue; }
        const t = p.life;
        let r, g, b, a;
        if (t > 0.7) { r = 255; g = 255; b = 150; a = t * 0.7; }
        else if (t > 0.45) { r = 255; g = Math.floor(160 * (t - 0.45) / 0.25 + 50); b = 0; a = t * 0.65; }
        else if (t > 0.2) { r = 255; g = Math.floor(50 * (t - 0.2) / 0.25); b = 0; a = t * 0.6; }
        else { r = 190; g = 10; b = 0; a = t * 2.5 * 0.45; }
        const gr = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
        gr.addColorStop(0, `rgba(${r},${g},${b},${a})`);
        gr.addColorStop(0.5, `rgba(${r},${Math.floor(g * 0.4)},0,${a * 0.5})`);
        gr.addColorStop(1, `rgba(${Math.floor(r * 0.3)},0,0,0)`);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = gr;
        ctx.fill();
      }
    };

    const drawGround = () => {
      ctx.globalCompositeOperation = 'source-over';
      const g = ctx.createLinearGradient(0, H - 50, 0, H);
      g.addColorStop(0, '#1a0600');
      g.addColorStop(1, '#040100');
      ctx.fillStyle = g;
      ctx.fillRect(0, H - 50, W, 50);

      // glowing coal line
      const burnedW = Math.min(spreadCols * 3, W);
      for (let x = 0; x < burnedW; x += 4) {
        const intensity = 0.4 + 0.6 * Math.sin(time * 0.15 + x * 0.03);
        ctx.fillStyle = `rgba(255,${Math.floor(60 * intensity)},0,${0.3 * intensity})`;
        ctx.fillRect(x, H - 52, 3, 4);
      }
    };

    const loop = () => {
      time++;
      if (spreadCols < COLS + 5) spreadCols += spreadRate;

      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = '#030200';
      ctx.fillRect(0, 0, W, H);

      // cellular fire (base layer)
      stepFire();
      renderFire();

      // volumetric particle layer on top
      spawnVolumetric();
      drawParticles();

      // embers
      ctx.globalCompositeOperation = 'screen';
      for (let i = embers.length - 1; i >= 0; i--) {
        embers[i].update();
        if (embers[i].life <= 0) { embers.splice(i, 1); continue; }
        embers[i].draw();
      }

      drawGround();

      ctx.globalCompositeOperation = 'source-over';
      for (let i = ashes.length - 1; i >= 0; i--) {
        ashes[i].update();
        if (ashes[i].life <= 0) { ashes.splice(i, 1); continue; }
        ashes[i].draw();
      }

      // hard cap
      if (particles.length > 2000) particles.splice(0, particles.length - 2000);
      if (embers.length > 400) embers.splice(0, embers.length - 400);
      if (ashes.length > 800) ashes.splice(0, ashes.length - 800);

      animationFrameId = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      window.removeEventListener('resize', initCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ display: 'block', width: '100%', height: '100%', pointerEvents: 'none' }}
    />
  );
};
