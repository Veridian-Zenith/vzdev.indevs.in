//! License: Open Software License 3.0 (OSL-3.0)
//! Copyright (c) 2026 Dae Euhwa

import { Suspense, lazy } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../utils';
import { useIsMobile } from '../hooks';

import { Terminal, Shield, PawPrint, Folder, Box } from 'lucide-react';

const ProjectCard = lazy(() => import('./ProjectCard').then(m => ({ default: m.ProjectCard })));

const STATIC_PROJECTS = [
  {
    id: 'voix',
    name: "Voix",
    description: "A secure privilege management tool (sudo/doas alternative) featuring PAM authentication, and a focus on minimal attack surface.",
    html_url: "https://github.com/Veridian-Zenith/Voix",
    topics: ["system", "security", "c++", "linux"],
    language: "C++",
    icon: Shield
  },
  {
    id: 'meshiji',
    name: "Meshiji",
    description: "A modern, cross-platform file explorer built with Flutter. Provides a clean, intuitive interface for managing files across Linux, Windows, and macOS.",
    html_url: "https://github.com/Veridian-Zenith/meshiji",
    topics: ["app", "flutter", "dart", "ui"],
    language: "Dart",
    icon: Folder
  },
  {
    id: 'peguni',
    name: "Peguni Draem'la",
    description: "A text-based virtual pet simulator featuring a unique constructed language (Vaesktöng). A companion in the terminal, built for the void.",
    html_url: "https://github.com/Veridian-Zenith/peguni_draem-la",
    topics: ["game", "lua", "conlang"],
    language: "Lua",
    icon: PawPrint
  },
  {
    id: 'misc',
    name: "Misc",
    description: "A repository of experimental artifacts and system utilities, including ZigSysMon—a lightweight /proc monitor—alongside benchmarks and FFI experiments.",
    html_url: "https://github.com/Veridian-Zenith/Misc",
    topics: ["collection", "zigsysmon", "benchmarks", "tools"],
    language: "Zig/Multi",
    icon: Box
  }
];

const topicColors: Record<string, string> = {
  web: 'border-amber-500/50 text-amber-500',
  app: 'border-red-500/50 text-red-500',
  game: 'border-gold-500/50 text-gold-500',
  system: 'border-purple-500/50 text-purple-500',
  collection: 'border-blue-500/50 text-blue-500',
};

export const ProjectsSection = () => {
  const isMobile = useIsMobile();
  return (
    <section id="projects" className="py-12 px-8 max-w-7xl mx-auto">
      <motion.h2
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        className="text-4xl sm:text-6xl font-bold text-center mb-16 text-primary-themeable drop-shadow-[0_0_10px_var(--vz-shadow-color)]"
      >
        Arcane Artifacts
      </motion.h2>
      <div className={cn(
        "grid gap-8",
        isMobile ? "flex overflow-x-auto pb-8 snap-x snap-mandatory scrollbar-hide -mx-8 px-8" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
      )}>
        {STATIC_PROJECTS.map((repo, index) => (
          <div key={repo.id} className={cn(isMobile && "min-w-[75vw] snap-center")}>
            <Suspense fallback={<div className="h-full w-full bg-secondary-themeable/20 rounded-2xl animate-pulse" />}>
              <ProjectCard repo={repo} index={index} topicColors={topicColors} />
            </Suspense>
          </div>
        ))}

        {/* Placeholder for future growth */}
        <div className={cn(
          "border border-dashed border-muted-themeable rounded-2xl flex flex-col items-center justify-center p-8 text-center bg-secondary-themeable opacity-50",
          isMobile && "min-w-[75vw] snap-center"
        )}>
          <Terminal size={32} className="text-secondary-themeable/40 mb-4" />
          <p className="text-secondary-themeable/60 italic">More artifacts currently being forged in the void...</p>
        </div>
      </div>
      {isMobile && (
        <div className="flex justify-center gap-2 mt-4">
          {STATIC_PROJECTS.map((_, i) => (
            <div key={i} className="w-1.5 h-1.5 rounded-full bg-muted-themeable" />
          ))}
          <div className="w-1.5 h-1.5 rounded-full bg-muted-themeable" />
        </div>
      )}
    </section>
  );
};
