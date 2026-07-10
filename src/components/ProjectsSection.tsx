//! License: Open Software License 3.0 (OSL-3.0)
//! Copyright (c) 2026 Dae Euhwa

import { motion } from 'framer-motion';
import { AnimatedCard } from './Common';
import { cn } from '../utils';
import { useIsMobile } from '../hooks';

import { ExternalLink, Terminal, Shield, PawPrint, Folder, Box } from 'lucide-react';

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
            <AnimatedCard
              delay={index * 0.1}
            >
            <div className="flex flex-col h-full">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary-themeable/10 rounded-lg text-primary-themeable border border-primary-themeable/20">
                    <repo.icon size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-primary-themeable">{repo.name}</h3>
                </div>
              </div>
              <p className="text-secondary-themeable mb-6 line-clamp-3 flex-grow text-sm leading-relaxed">
                {repo.description}
              </p>
              <div className="flex flex-wrap gap-2 mb-6">
                {repo.topics.map(topic => (
                  <span
                    key={topic}
                    className={cn(
                      "text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border bg-secondary-themeable/40 font-bold",
                      topicColors[topic] || 'border-muted-themeable text-secondary-themeable'
                    )}
                  >
                    {topic}
                  </span>
                ))}
                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border border-primary-themeable/50 text-primary-themeable bg-secondary-themeable/40 font-bold">
                  {repo.language}
                </span>
              </div>
              <a
                href={repo.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-2 text-primary-themeable hover:brightness-125 transition-all mt-auto font-semibold text-sm"
              >
                Inspect Rune
                <ExternalLink size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </a>
            </div>
          </AnimatedCard>
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
