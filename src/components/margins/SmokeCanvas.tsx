import { useEffect, useRef } from 'react';

interface Particle {
    x: number; y: number;
    vx: number; vy: number;
    life: number; decay: number; r: number;
}

interface Props {
    style?: React.CSSProperties;
    width: number;
    height: number;
    rate?: number;
    drift?: number;
}

export default function SmokeCanvas({ style, width, height, rate = 0.4, drift = 0.4 }: Props) {
    const ref = useRef<HTMLCanvasElement>(null);
    const tick = useRef(0);
    const particles = useRef<Particle[]>([]);

    useEffect(() => {
        const canvas = ref.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d')!;
        let raf: number;

        function spawn() {
            particles.current.push({
                x: width / 2 + (Math.random() - 0.5) * 3,
                y: height,
                vx: (Math.random() - 0.5) * drift,
                vy: -(0.25 + Math.random() * 0.35),
                life: 1,
                decay: 0.006 + Math.random() * 0.006,
                r: 1.5 + Math.random() * 2,
            });
        }

        function step() {
            tick.current++;
            if (Math.random() < rate) spawn();

            ctx.clearRect(0, 0, width, height);
            particles.current = particles.current.filter(p => p.life > 0);

            for (const p of particles.current) {
                p.x += p.vx + Math.sin(tick.current * 0.04 + p.y) * 0.15;
                p.y += p.vy;
                p.r += 0.025;
                p.life -= p.decay;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(26,18,8,${p.life * 0.28})`;
                ctx.fill();
            }

            raf = requestAnimationFrame(step);
        }

        raf = requestAnimationFrame(step);
        return () => cancelAnimationFrame(raf);
    }, [width, height, rate, drift]);

    return (
        <canvas
            ref={ref}
            width={width}
            height={height}
            style={{ pointerEvents: 'none', ...style }}
        />
    );
}