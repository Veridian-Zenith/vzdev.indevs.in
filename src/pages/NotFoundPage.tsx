//! License: Open Software License 3.0 (OSL-3.0)
//! Copyright (c) 2026 Dae Euhwa

import { Link } from 'react-router-dom';
import { Brackets, BlueprintGrid, PillButton } from '../components/Forge';

export const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden">
      <div className="relative w-full max-w-2xl">
        <div className="relative bg-black border border-amber-400/20 rounded-2xl overflow-hidden">
          <Brackets />
          <BlueprintGrid />
          <div className="relative p-10 sm:p-14 text-center">
            <span className="text-[9px] font-mono uppercase tracking-[0.3em] text-amber-400/50">
              error · 404
            </span>
            <h1 className="mt-5 text-6xl sm:text-8xl font-black tracking-tighter leading-[0.85] text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-amber-400 to-amber-700">
              404
            </h1>
            <p className="mt-6 text-sm sm:text-base text-amber-100/45 max-w-md mx-auto leading-relaxed">
              The rune you seek does not exist in this digital forge. Return to the artifacts, or
              continue exploring the void.
            </p>
            <div className="mt-9 flex flex-col sm:flex-row gap-3 justify-center">
              <PillButton href="/" variant="solid">Return home</PillButton>
              <PillButton href="/projects">Browse artifacts</PillButton>
            </div>
            <div className="mt-10 pt-6 border-t border-amber-400/15">
              <Link
                to="/contact"
                className="text-[10px] font-mono uppercase tracking-[0.25em] text-amber-400/40 hover:text-amber-300 transition-colors"
              >
                report a fracture
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
