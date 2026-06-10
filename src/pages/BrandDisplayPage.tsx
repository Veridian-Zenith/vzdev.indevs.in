//! License: Open Software License 3.0 (OSL-3.0)
//! Copyright (c) 2026 Dae Euhwa

import { useRef } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";

export const BrandDisplayPage = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth parallax springs
  const springX = useSpring(mouseX, { stiffness: 150, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 150, damping: 20 });

  const rotateX = useTransform(springY, [-0.5, 0.5], [20, -20]);
  const rotateY = useTransform(springX, [-0.5, 0.5], [-20, 20]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

    return (
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="pt-32 pb-24 px-8 flex flex-col items-center justify-center min-h-[calc(100vh-80px)] cursor-crosshair overflow-hidden"
      >
        <div className="text-center mb-12">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl sm:text-5xl font-bold text-primary-themeable mb-2 tracking-tight"
          >
            The Sigil
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-secondary-themeable italic opacity-60"
          >
            "The core resonance of the digital forge."
          </motion.p>
        </div>
        <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative group"
        style={{
          rotateX,
          rotateY,
          perspective: 1000,
          transformStyle: "preserve-3d",
        }}
      >
        {/* Layered Glows */}
        <div className="absolute -inset-20 bg-[var(--vz-accent-vibrant)]/10 rounded-full blur-[100px] group-hover:bg-[var(--vz-accent-vibrant)]/20 transition-colors duration-700" />
        <div className="absolute -inset-10 bg-[var(--vz-accent-vibrant)]/5 rounded-full blur-[80px] group-hover:bg-[var(--vz-accent-vibrant)]/15 transition-colors duration-1000 delay-100" />

        {/* Floating Ring */}
        <motion.div
          className="absolute -inset-8 border border-[var(--vz-accent-vibrant)]/10 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          style={{ translateZ: -50 }}
        />

        {/* Logo Container */}
        <motion.div
          className="relative"
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Main Logo */}
          <motion.img
            src="/assets/brand-image.png"
            alt="Veridian Zenith Core Logo"
            className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 object-contain filter drop-shadow-[0_0_30px_var(--vz-glow-color)] group-hover:drop-shadow-[0_0_60px_var(--vz-glow-color)] transition-all duration-700"
            style={{ translateZ: 100 }}
            animate={{
              y: [0, -15, 0],
              filter: [
                `drop-shadow(0 0 30px var(--vz-glow-color)) brightness(1)`,
                `drop-shadow(0 0 50px var(--vz-glow-color)) brightness(1.2)`,
                `drop-shadow(0 0 30px var(--vz-glow-color)) brightness(1)`,
              ],
            }}
            transition={{
              y: { duration: 5, repeat: Infinity, ease: "easeInOut" },
              filter: { duration: 3, repeat: Infinity, ease: "easeInOut" },
            }}
          />

          {/* Back Reflection */}
          <motion.img
            src="/assets/brand-image.png"
            alt=""
            className="absolute inset-0 w-full h-full object-contain opacity-20 blur-sm pointer-events-none"
            style={{ translateZ: -20, scale: 1.1 }}
          />
        </motion.div>
      </motion.div>
    </div>
  );
};
