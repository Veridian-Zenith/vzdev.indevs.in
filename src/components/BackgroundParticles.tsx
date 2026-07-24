//! License: Open Software License 3.0 (OSL-3.0)
//! Copyright (c) 2026 Dae Euhwa

import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useState } from "react";
import { useIsMobile } from "../hooks";

const RUNES = [
  "ᚦ","ᚧ","ᚨ","ᚱ","ᚷ","ᚹ","ᚺ","ᚾ","ᛁ","ᛃ",
  "ᛈ","ᛇ","ᛉ","ᛊ","ᛏ","ᛒ","ᛖ","ᛗ","ᛚ","ᛝ","ᛟ","ᛞ"
];

export const BackgroundParticles = () => {
  const isMobile = useIsMobile();
  const { scrollYProgress } = useScroll();
  const yRange = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const ySpring = useSpring(yRange, { stiffness: 50, damping: 20 });

  // Pre-generate positions and speeds for runes to avoid jitter
  const [massiveRunes] = useState(() => [...Array(isMobile ? 3 : 18)].map((_, i) => ({
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    size: `${10 + Math.random() * 15}rem`,
    speed: 30 + Math.random() * 20,
    direction: i % 2 === 0 ? 1 : -1,
    rune: RUNES[i % RUNES.length],
  })));

  const [tinyRunes] = useState(() => [...Array(isMobile ? 0 : 50)].map((_, i) => ({
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    size: `${Math.random() * 0.8 + 0.5}rem`,
    speed: 6 + Math.random() * 6,
    delay: Math.random() * 5,
    rune: RUNES[i % RUNES.length],
  })));



  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {/* 1. Base Layer: vibrant gradients, static */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(135deg, #d72638 0%, #ffb347 50%, #ffd700 100%)"
        }}
      />

      {/* 2. Massive Runes - drifting side to side with slight rotation */}
      <motion.div style={{ y: ySpring }} className="absolute inset-0">
        {massiveRunes.map((r, i) => (
          <motion.div
            key={`massive-${i}`}
            className="absolute text-amber-500/40 font-serif select-none pointer-events-none filter blur-[0.5px]"
            style={{
              fontSize: r.size,
              left: r.left,
              top: r.top,
            }}
            animate={{
              x: [0, r.direction * 60, 0],
              rotate: [0, 360, 0],
            }}
            transition={{
              duration: r.speed,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {r.rune}
          </motion.div>
        ))}
      </motion.div>

      {/* 3. Tiny Runes - drifting up and down */}
      <div className="absolute inset-0">
        {tinyRunes.map((r, i) => (
          <motion.div
            key={`tiny-${i}`}
            className="absolute text-amber-400 select-none font-serif drop-shadow-[0_0_8px_rgba(255,179,71,0.8)]"
            style={{
              fontSize: r.size,
              left: r.left,
              top: r.top,
            }}
            animate={{
              y: [0, -50, 0],
              rotate: [0, 180, 0],
            }}
            transition={{
              duration: r.speed,
              repeat: Infinity,
              ease: "easeInOut",
              delay: r.delay,
            }}

          >
            {r.rune}
          </motion.div>
        ))}
      </div>
    </div>
  );
};
