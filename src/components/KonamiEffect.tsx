import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useKonamiCode } from '../hooks/useKonamiCode';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  color: string;
}

export const KonamiEffect = () => {
  const isTriggered = useKonamiCode();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!isTriggered || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let opacity = 0;
    const particles: Particle[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resize);
    resize();

    // Initialize particles
    for (let i = 0; i < 200; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 1,
        speedX: (Math.random() - 0.5) * 10,
        speedY: (Math.random() - 0.5) * 10,
        color: `hsl(${Math.random() * 60 + 150}, 100%, 50%)`
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      opacity = Math.min(opacity + 0.01, 1);
      ctx.globalAlpha = opacity;

      particles.forEach(p => {
        p.x += p.speedX;
        p.y += p.speedY;

        if (p.x < 0 || p.x > canvas.width) p.speedX *= -1;
        if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;

        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        // Draw lines between nearby particles
        particles.forEach(p2 => {
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.strokeStyle = p.color;
            ctx.lineWidth = (1 - dist / 100) * 0.5;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        });
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
    };
  }, [isTriggered]);

  return (
    <AnimatePresence>
      {isTriggered && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] pointer-events-none"
        >
          <canvas ref={canvasRef} className="absolute inset-0" />
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <motion.h2
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-6xl font-bold text-primary-themeable italic tracking-tighter drop-shadow-[0_0_30px_var(--vz-glow-color)]"
            >
              ZENITH OVERDRIVE
            </motion.h2>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
