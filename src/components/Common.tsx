//! License: Open Software License 3.0 (OSL-3.0)
//! Copyright (c) 2026 Dae Euhwa

import { motion, type HTMLMotionProps, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { cn } from '../utils';
import { useIsMobile } from '../hooks';
import { VAESKTONG_MAP } from '../utils';



interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: 'amber' | 'red' | 'gold';
  delay?: number;
}

export const AnimatedCard = ({ children, className, delay = 0 }: AnimatedCardProps) => {
  const isMobile = useIsMobile();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{
        duration: 0.6,
        delay,
        type: "spring",
        stiffness: 100
      }}
      whileHover={isMobile ? {} : {
        y: -10,
        scale: 1.02,
        transition: { duration: 0.3 }
      }}
      className={cn(
        "bg-[var(--vz-card-bg)] rounded-3xl border border-[var(--vz-card-border)] p-8 transition-all duration-300 backdrop-blur-sm",
        "shadow-[0_0_15px_var(--vz-shadow-color)] hover:shadow-[0_0_35px_var(--vz-shadow-color)]",
        className
      )}
    >
      {children}
    </motion.div>
  );
};

interface InteractiveButtonProps extends HTMLMotionProps<"button"> {
  variant?: 'amber' | 'red' | 'gold';
  children: React.ReactNode;
}

export const InteractiveButton = ({ children, variant = 'amber', className, ...props }: InteractiveButtonProps) => {
  const isMobile = useIsMobile();
  const bgColors = {
    amber: 'bg-primary-themeable/80 hover:bg-primary-themeable shadow-primary-themeable',
    red: 'bg-primary-themeable/80 hover:bg-primary-themeable shadow-primary-themeable',
    gold: 'bg-primary-themeable/80 hover:bg-primary-themeable shadow-primary-themeable',
  };

  return (
    <motion.button
      whileHover={isMobile ? {} : {
        scale: 1.05,
        y: -2,
      }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        "relative overflow-hidden rounded-2xl px-8 py-4 font-bold text-white transition-all duration-300 cursor-pointer group border border-muted-themeable hover:border-primary-themeable",
        bgColors[variant],
        className
      )}
      {...props}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-themeable/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
};

export const VaesktongTooltip = ({ children, word }: { children: React.ReactNode, word: string }) => {
  const [isVisible, setIsVisible] = useState(false);
  const translation = VAESKTONG_MAP[word.toLowerCase()];

  if (!translation) return <>{children}</>;

  return (
    <span
      className="relative cursor-help"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      <span className="border-b border-dotted border-primary-themeable/50">{children}</span>
      <AnimatePresence>
        {isVisible && (
          <motion.span
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-[var(--vz-bg-primary)] border border-primary-themeable text-primary-themeable text-sm rounded-lg whitespace-nowrap z-50 shadow-[0_0_20px_rgba(var(--vz-accent-rgb),0.3)] backdrop-blur-md"
          >
            <span className="font-serif italic opacity-70 text-xs block mb-0.5">Vaesktöng:</span>
            {translation}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
};
