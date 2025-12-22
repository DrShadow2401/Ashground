
'use client';

import React, { useRef, useEffect } from 'react';

// Helper function
const rand = (min: number, max: number): number => Math.random() * (max - min) + min;

// --- Particle Classes ---
class Flame {
    cx: number;
    cy: number;
    x: number;
    y: number;
    lx: number;
    ly: number;
    vy: number;
    vx: number;
    r: number;
    life: number;
    alive: boolean;
    c: { h: number; s: number; l: number; a: number; ta: number; };
    grd1?: CanvasGradient;
    grd2?: CanvasGradient;

    constructor(mouse: { x: number, y: number }) {
        this.cx = mouse.x;
        this.cy = mouse.y;
        this.x = rand(this.cx - 25, this.cx + 25);
        this.y = rand(this.cy - 5, this.cy + 5);
        this.lx = this.x;
        this.ly = this.y;
        this.vy = rand(1, 4); // Increased velocity
        this.vx = rand(-2, 2); // Increased velocity
        this.r = rand(40, 60); // Increased radius
        this.life = rand(3, 8); // Increased life
        this.alive = true;
        this.c = {
            h: Math.floor(rand(2, 40)),
            s: 100,
            l: rand(80, 100),
            a: 0,
            ta: rand(0.8, 0.9)
        };
    }

    update() {
        this.lx = this.x;
        this.ly = this.y;
        this.y -= this.vy;
        this.vy += 0.09; // Slightly increased gravity
        this.x += this.vx;

        if (this.x < this.cx) this.vx += 0.3;
        else this.vx -= 0.3;

        if (this.r > 0) this.r -= 0.4; // Faster shrink
        if (this.r <= 0) this.r = 0;

        this.life -= 0.1; // Faster decay

        if (this.life <= 0) {
            this.c.a -= 0.05;
            if (this.c.a <= 0) this.alive = false;
        } else if (this.life > 0 && this.c.a < this.c.ta) {
            this.c.a += .08;
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        this.grd1 = ctx.createRadialGradient(this.x, this.y, this.r * 3, this.x, this.y, 0);
        this.grd1.addColorStop(0.5, `hsla(${this.c.h}, ${this.c.s}%, ${this.c.l}%, ${this.c.a / 20})`);
        this.grd1.addColorStop(0, "transparent");

        this.grd2 = ctx.createRadialGradient(this.x, this.y, this.r, this.x, this.y, 0);
        this.grd2.addColorStop(0.5, `hsla(${this.c.h}, ${this.c.s}%, ${this.c.l}%, ${this.c.a})`);
        this.grd2.addColorStop(0, "transparent");

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r * 3, 0, 2 * Math.PI);
        ctx.fillStyle = this.grd1;
        ctx.fill();

        ctx.globalCompositeOperation = "overlay";
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
        ctx.fillStyle = this.grd2;
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(this.lx, this.ly);
        ctx.lineTo(this.x, this.y);
        ctx.strokeStyle = `hsla(${this.c.h}, ${this.c.s}%, ${this.c.l}%, 1)`;
        ctx.lineWidth = rand(1, 3); // Thicker trail
        ctx.stroke();
        ctx.closePath();
    }
}

class Spark {
    cx: number;
    cy: number;
    x: number;
    y: number;
    lx: number;
    ly: number;
    vy: number;
    vx: number;
    r: number;
    life: number;
    alive: boolean;
    c: { h: number; s: number; l: number; a: number; };

    constructor(mouse: { x: number, y: number }) {
        this.cx = mouse.x;
        this.cy = mouse.y;
        this.x = rand(this.cx - 50, this.cx + 50); // Wider spawn
        this.y = rand(this.cy, this.cy + 10);
        this.lx = this.x;
        this.ly = this.y;
        this.vy = rand(2, 5); // Faster
        this.vx = rand(-8, 8); // Much wider spread
        this.r = rand(0.5, 2); // Bigger sparks
        this.life = rand(5, 10); // Longer life
        this.alive = true;
        this.c = {
            h: Math.floor(rand(2, 40)),
            s: 100,
            l: rand(40, 100),
            a: rand(0.8, 0.9)
        };
    }

    update() {
        this.lx = this.x;
        this.ly = this.y;
        this.y -= this.vy;
        this.x += this.vx;

        if (this.x < this.cx) this.vx += 0.25;
        else this.vx -= 0.25;

        this.vy += 0.1;
        this.life -= 0.1;

        if (this.life <= 0) {
            this.c.a -= 0.05;
            if (this.c.a <= 0) this.alive = false;
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.moveTo(this.lx, this.ly);
        ctx.lineTo(this.x, this.y);
        ctx.strokeStyle = `hsla(${this.c.h}, ${this.c.s}%, ${this.c.l}%, ${this.c.a / 2})`;
        ctx.lineWidth = this.r * 2;
        ctx.lineCap = 'round';
        ctx.stroke();
        ctx.closePath();

        ctx.beginPath();
        ctx.moveTo(this.lx, this.ly);
        ctx.lineTo(this.x, this.y);
        ctx.strokeStyle = `hsla(${this.c.h}, ${this.c.s}%, ${this.c.l}%, ${this.c.a})`;
        ctx.lineWidth = this.r;
        ctx.stroke();
        ctx.closePath();
    }
}


interface NewNoteBurningEffectProps {
    bgImageUri: string;
    onComplete: () => void;
}

const NewNoteBurningEffect: React.FC<NewNoteBurningEffectProps> = ({ bgImageUri, onComplete }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationFrameId = useRef<number>();
    const fireInstanceRef = useRef<any>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let bRuning = true;

        const mouse = {
            x: window.innerWidth * .5,
            y: window.innerHeight * .75,
        };

        const aFires: Flame[] = [];
        const aSpark: Spark[] = [];
        const aSpark2: Spark[] = [];

        const imageObj = new Image();
        imageObj.src = bgImageUri;
        let pattern: CanvasPattern | null = null;
        imageObj.onload = () => {
            pattern = ctx.createPattern(imageObj, 'repeat');
        };

        const updateMouse = (e: MouseEvent) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        };

        const clearCanvas = () => {
            ctx.globalCompositeOperation = "source-over";
            ctx.fillStyle = "rgba(15, 5, 2, 1)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            if (pattern) {
                ctx.globalCompositeOperation = "lighter";
                ctx.rect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = pattern;
                ctx.fill();
            }
        };

        const drawHalo = () => {
            const r = rand(300, 350);
            ctx.globalCompositeOperation = "lighter";
            const grd = ctx.createRadialGradient(mouse.x, mouse.y, r, mouse.x, mouse.y, 0);
            grd.addColorStop(0, "transparent");
            grd.addColorStop(1, "rgb(50, 2, 0)");
            ctx.beginPath();
            ctx.arc(mouse.x, mouse.y - 100, r, 0, 2 * Math.PI);
            ctx.fillStyle = grd;
            ctx.fill();
        };

        const drawTxt = () => {
            const mousePCx = ((canvas.width / 2) - mouse.x) / 20;
            const mousePCy = ((canvas.height / 2) - mouse.y) / 20;

            ctx.globalCompositeOperation = "source-over";
            ctx.save();
            ctx.font = "12em Amatic SC";
            ctx.textAlign = "center";
            ctx.strokeStyle = "rgb(50, 50, 0)";
            ctx.fillStyle = "rgb(100, 10, 0)";
            ctx.lineWidth = 2;
            ctx.shadowColor = "rgba(10, 0, 0, 0.5)";
            ctx.shadowOffsetX = rand(mousePCx - 2, mousePCx + 2);
            ctx.shadowOffsetY = rand(mousePCy - 2, mousePCy + 2);
            ctx.shadowBlur = rand(7, 10);
            ctx.strokeText("burn it", canvas.width / 2, canvas.height * .72);
            ctx.fillText("burn it", canvas.width / 2, canvas.height * .72);
            ctx.restore();
        };


        const update = () => {
            // Increased particle generation for more intensity, but balanced for performance
            for (let k = 0; k < 2; k++) {
                aFires.push(new Flame(mouse));
                aSpark.push(new Spark(mouse));
                aSpark2.push(new Spark(mouse));
            }

            for (let i = aFires.length - 1; i >= 0; i--) {
                if (aFires[i].alive) aFires[i].update();
                else aFires.splice(i, 1);
            }
            for (let i = aSpark.length - 1; i >= 0; i--) {
                if (aSpark[i].alive) aSpark[i].update();
                else aSpark.splice(i, 1);
            }
            for (let i = aSpark2.length - 1; i >= 0; i--) {
                if (aSpark2[i].alive) aSpark2[i].update();
                else aSpark2.splice(i, 1);
            }
        };

        const draw = () => {
            clearCanvas();
            drawHalo();
            drawTxt();

            ctx.globalCompositeOperation = "overlay";
            for (let i = aFires.length - 1; i >= 0; i--) {
                aFires[i].draw(ctx);
            }

            ctx.globalCompositeOperation = "soft-light";
            for (let i = aSpark.length - 1; i >= 0; i--) {
                if ((i % 2) === 0) aSpark[i].draw(ctx);
            }

            ctx.globalCompositeOperation = "color-dodge";
            for (let i = aSpark2.length - 1; i >= 0; i--) {
                aSpark2[i].draw(ctx);
            }
        };

        const run = () => {
            if (!bRuning) return;
            update();
            draw();
            animationFrameId.current = requestAnimationFrame(run);
        };


        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        // --- Init and Cleanup ---
        handleResize();
        window.addEventListener('resize', handleResize);
        canvas.addEventListener('mousemove', updateMouse, false);

        run(); // Start animation loop

        return () => {
            bRuning = false;
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
            window.removeEventListener('resize', handleResize);
            canvas.removeEventListener('mousemove', updateMouse, false);
        };

    }, [bgImageUri]);

    return (
        <canvas
            ref={canvasRef}
            id="fire"
            className="fixed top-0 left-0 w-full h-full z-[1000] pointer-events-auto"
        />
    );
};

export default NewNoteBurningEffect;
