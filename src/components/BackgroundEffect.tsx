//! License: Open Software License 3.0 (OSL-3.0)
//! Copyright (c) 2026 Dae Euhwa

import { motion } from "framer-motion";
import { useIsMobile } from "../hooks";
import { useState } from "react";

const RUNES = [
  "ᚦ", "ᚧ", "ᚨ", "ᚱ", "ᚷ", "ᚹ", "ᚺ", "ᚾ", "ᛁ", "ᛃ",
  "ᛈ", "ᛇ", "ᛉ", "ᛊ", "ᛏ", "ᛒ", "ᛖ", "ᛗ", "ᛚ", "ᛝ", "ᛟ", "ᛞ"
];

export const BackgroundEffect = () => {
  const isMobile = useIsMobile();

  const [floatingRunes] = useState(() => {
    const count = isMobile ? 14 : 24;
    const cols = isMobile ? 4 : 6;
    const rows = isMobile ? 2 : 4;
    return Array.from({ length: count }, (_, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols) % rows;
      const offsetX = (Math.random() - 0.5) * 15; // small random jitter
      const offsetY = (Math.random() - 0.5) * 15;
      return {
        left: `${((col / cols) * 100) + offsetX}%`,
        top: `${((row / rows) * 100) + offsetY}%`,
        size: isMobile ? `${0.6 + Math.random() * 0.8}rem` : `${1.2 + Math.random() * 2.2}rem`,
        speed: isMobile ? 10 + Math.random() * 6 : 18 + Math.random() * 12,
        delay: Math.random() * 4,
        rune: RUNES[i % RUNES.length],
        opacity: isMobile ? 0.4 : 0.45,
      };
    });
  });

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-[var(--vz-bg-primary)]">
      {/* Subtle glass gradient layer */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          background: "linear-gradient(135deg, var(--vz-gradient-1) 0%, var(--vz-gradient-2) 50%, var(--vz-gradient-3) 100%)",
        }}
      />

      {/* Floating visible runes */}
      <div className="absolute inset-0">
        {floatingRunes.map((r, i) => (
          <motion.div
            key={`rune-${i}`}
            className="absolute text-[var(--vz-accent-vibrant)] font-serif select-none pointer-events-none"
            style={{
              fontSize: r.size,
              left: r.left,
              top: r.top,
              opacity: r.opacity,
              filter: "drop-shadow(0 0 8px var(--vz-glow-color))",
            }}
            animate={{
              y: [0, -40, 0],
              rotate: [0, 180, 0],
              opacity: [r.opacity * 0.7, r.opacity, r.opacity * 0.7],
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

      {/* Soft depth overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--vz-bg-primary)]/30 to-[var(--vz-bg-primary)] pointer-events-none" />
    </div>
  );
};
