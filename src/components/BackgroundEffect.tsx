//! License: Open Software License 3.0 (OSL-3.0)
//! Copyright (c) 2026 Dae Euhwa

import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useIsMobile } from "../hooks";
import { useState } from "react";


const RUNES = [
  "ᚦ", "ᚧ", "ᚨ", "ᚱ", "ᚷ", "ᚹ", "ᚺ", "ᚾ", "ᛁ", "ᛃ",
  "ᛈ", "ᛇ", "ᛉ", "ᛊ", "ᛏ", "ᛒ", "ᛖ", "ᛗ", "ᛚ", "ᛝ", "ᛟ", "ᛞ"
];

type Rune = {
  left: string;
  top: string;
  size: string;
  speed: number;
  direction?: number;
  rune: string;
  delay?: number;
};


export const BackgroundEffect = () => {
  const isMobile = useIsMobile();
  const { scrollYProgress } = useScroll();
  const yRange = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const ySpring = useSpring(yRange, { stiffness: 50, damping: 20 });

  // Pre-generate positions for consistency using lazy useState to satisfy purity rules
  const [massiveRunes] = useState(() => [...Array(15)].map((_, i) => ({
    left: `${(i * 17) % 100}%`,
    top: `${(i * 23) % 100}%`,
    size: `${10 + Math.random() * 15}rem`,
    speed: 35 + i * 5,
    direction: i % 2 === 0 ? 1 : -1,
    rune: RUNES[i % RUNES.length],
  })));

  const [tinyRunes] = useState(() => [...Array(60)].map((_, i) => ({
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    size: `${Math.random() * 0.8 + 0.5}rem`,
    speed: 6 + Math.random() * 6,
    delay: Math.random() * 5,
    rune: RUNES[i % RUNES.length],
  })));

  // Performance optimizations for mobile
  const activeMassiveRunes = isMobile ? massiveRunes.slice(0, 3) : massiveRunes;
  const activeTinyRunes = isMobile ? [] : tinyRunes;
  const showGrid = !isMobile;
  const gridRunesCount = isMobile ? 0 : 200;
  const gridCols = 10;




  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-[var(--vz-bg-primary)]">

      {/* 1. Base Layer: vibrant gradients */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(135deg, var(--vz-gradient-1) 0%, var(--vz-gradient-2) 50%, var(--vz-gradient-3) 100%)",
          opacity: 0.15
        }}
      />

      {/* 2. Middle Layer: Massive Runes (parallax drift) */}
      <motion.div style={{ y: ySpring }} className="absolute inset-0">
        {activeMassiveRunes.map((r: Rune, i: number) => (
          <motion.div
            key={`massive-${i}`}
            className={`absolute text-[var(--vz-accent-vibrant)] font-serif select-none pointer-events-none transform-gpu ${!isMobile ? "filter blur-[0.5px] drop-shadow-[0_0_15px_var(--vz-accent-vibrant)]" : ""}`}
            style={{ fontSize: r.size, left: r.left, top: r.top, opacity: isMobile ? 0.08 : 0.25 }}
            animate={isMobile ? {} : {
              x: [0, (r.direction ?? 1) * 50, 0],
              rotate: [0, 360, 0],
              opacity: [0.15, 0.35, 0.15]
            }}
            transition={isMobile ? {} : { duration: r.speed, repeat: Infinity, ease: "easeInOut" }}
          >
            {r.rune}
          </motion.div>
        ))}
      </motion.div>

      {/* 3. Surface Layer: Microscopic Grid Runes */}
      {showGrid && (
        <div className={`absolute inset-0 opacity-[0.05] pointer-events-none grid gap-16 p-10 rotate-12 scale-150`} style={{ gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))` }}>
          {[...Array(gridRunesCount)].map((_, i) => (
            <motion.span
              key={i}
              className="text-2xl font-serif text-[var(--vz-accent-vibrant)] block text-center"
              animate={{ opacity: [0.2, 0.7, 0.2] }}
              transition={{ duration: 4, delay: i * 0.02, repeat: Infinity, ease: "easeInOut" }}
            >
              {RUNES[i % RUNES.length]}
            </motion.span>
          ))}
        </div>
      )}

      {/* 4. Top Layer: Tiny Floating Runes */}
      <div className="absolute inset-0">
        {activeTinyRunes.map((r: Rune, i: number) => (
          <motion.div
            key={`tiny-${i}`}
            className="absolute text-[var(--vz-accent-vibrant)]/60 select-none font-serif transform-gpu drop-shadow-[0_0_10px_var(--vz-shadow-color)]"
            style={{ fontSize: r.size, left: r.left, top: r.top }}
            animate={{
              y: [0, -50, 0],
              rotate: [0, 180, 0]
            }}
            transition={{
              duration: r.speed,
              repeat: Infinity,
              ease: isMobile ? "linear" : "easeInOut",
              delay: r.delay
            }}
          >
            {r.rune}
          </motion.div>
        ))}

      </div>

      {/* 5. Depth Overlay: subtle dim only */}
      <div className="absolute inset-0 bg-[var(--vz-bg-primary)]/60 pointer-events-none" />
    </div>
  );
};
