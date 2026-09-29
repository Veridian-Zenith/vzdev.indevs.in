import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const NotFoundPage = () => {
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!glowRef.current) return;
    const tl = gsap.timeline({ repeat: -1, yoyo: true });
    tl.to(glowRef.current, {
      opacity: 0.4,
      scale: 1.15,
      duration: 3,
      ease: 'sine.inOut',
    });
    return () => { tl.kill(); };
  }, []);

  return (
    <div className="min-h-screen bg-black text-amber-400 selection:bg-amber-400/20 relative overflow-hidden flex items-center justify-center px-6">
      {/* Background glow */}
      <div
        ref={glowRef}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vh] rounded-full bg-gradient-to-br from-amber-500/20 via-red-600/10 to-amber-500/10 blur-[120px] pointer-events-none opacity-30"
      />

      <div className="relative z-10 max-w-3xl mx-auto text-center space-y-8">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="text-[clamp(4rem,14vw,10rem)] font-black leading-[0.85] tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-amber-300 via-amber-500 to-amber-700 drop-shadow-[0_0_60px_rgba(255,179,71,0.35)]"
        >
          404
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="space-y-4"
        >
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-amber-200/90 tracking-tight">
            Artifact Not Found
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-amber-100/60 max-w-xl mx-auto leading-relaxed">
            The rune you seek does not exist in this digital forge. Return to the artifacts, or continue exploring the void.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="flex flex-wrap justify-center gap-4 pt-4"
        >
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-8 py-3 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-400/30 rounded-full text-amber-300 font-bold transition-all hover:scale-[1.03] hover:shadow-[0_0_20px_rgba(255,179,71,0.25)]"
          >
            Return Home <ArrowUpRight size={16} />
          </Link>
          <Link
            to="/projects"
            className="inline-flex items-center gap-2 px-8 py-3 bg-transparent hover:bg-amber-500/5 border border-amber-400/20 rounded-full text-amber-200/80 font-semibold transition-all hover:scale-[1.03]"
          >
            Browse Artifacts
          </Link>
        </motion.div>
      </div>
    </div>
  );
};
