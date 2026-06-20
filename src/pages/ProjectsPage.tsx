//! License: Open Software License 3.0 (OSL-3.0)
//! Copyright (c) 2026 Dae Euhwa

import { motion } from 'framer-motion';
import { AnimatedCard } from '../components/Common';
import { cn } from '../utils/cn';
import { ExternalLink, Terminal, Shield, PawPrint, Folder, Box } from 'lucide-react';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useIsMobile } from '../hooks/useIsMobile';

const STATIC_PROJECTS = [
  {
    id: 'voix',
    name: "Voix",
    description: "projects.voix.description",
    html_url: "https://github.com/Veridian-Zenith/Voix",
    topics: ["system", "security", "c++", "linux"],
    language: "C++",
    icon: Shield
  },
  {
    id: 'meshiji',
    name: "Meshiji",
    description: "projects.meshiji.description",
    html_url: "https://github.com/Veridian-Zenith/meshiji",
    topics: ["app", "flutter", "dart", "ui", "linux"],
    language: "Dart",
    icon: Folder,
    deprecated: true
  },
  {
    id: 'peguni',
    name: "Peguni Draem'la",
    description: "projects.peguni.description",
    html_url: "https://github.com/Veridian-Zenith/peguni_draem-la",
    topics: ["game", "lua", "conlang"],
    language: "Lua",
    icon: PawPrint
  },
  {
    id: 'wuming',
    name: "WuMing",
    description: "projects.wuming.description",
    html_url: "https://github.com/Veridian-Zenith/WuMing",
    topics: ["app", "security", "c", "gtk4"],
    language: "C",
    icon: Shield
  },
  {
    id: 'misc',
    name: "Misc",
    description: "projects.misc.description",
    html_url: "https://github.com/Veridian-Zenith/Misc",
    topics: ["collection", "zigsysmon", "benchmarks", "tools"],
    language: "Zig/Multi",
    icon: Box
  },
  {
    id: 'nxo',
    name: "Nxo",
    description: "projects.nxo.description",
    html_url: "https://github.com/Veridian-Zenith/Nxo",
    topics: ["app", "kotlin", "android"],
    language: "Kotlin",
    icon: Box
  },
  {
    id: 'aether',
    name: "Aether",
    description: "projects.aether.description",
    html_url: "https://github.com/Veridian-Zenith/Aether",
    topics: ["system", "c++", "linux"],
    language: "C++",
    icon: Shield
  }
];

const topicColors: Record<string, string> = {
  web: 'border-amber-500/50 text-amber-500 shadow-[0_0_10px_rgba(255,179,71,0.2)]',
  app: 'border-red-500/50 text-red-500 shadow-[0_0_10px_rgba(215,38,56,0.2)]',
  game: 'border-gold-500/50 text-gold-500 shadow-[0_0_10px_rgba(255,215,0,0.2)]',
  system: 'border-purple-500/50 text-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.2)]',
  collection: 'border-blue-500/50 text-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.2)]',
};

export const ProjectsPage = () => {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const [hoveredProjectId, setHoveredProjectId] = useState<string | null>(null);

  return (
    <div className="pt-32 pb-24 px-8 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16 relative"
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary-themeable/10 blur-[100px] pointer-events-none" />
        <h1 className="text-5xl sm:text-7xl font-bold text-primary-themeable mb-6 drop-shadow-glow-themeable">
          {t('projects.title')}
        </h1>
        <p className="text-secondary-themeable max-w-2xl mx-auto text-lg leading-relaxed">
          {t('projects.subtitle')}
        </p>
      </motion.div>

      <div className={cn(
        "grid gap-8",
        isMobile ? "flex overflow-x-auto pb-8 snap-x snap-mandatory scrollbar-hide -mx-8 px-8" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
      )}>
        {STATIC_PROJECTS.map((repo, index) => {
          return (
            <div
              key={repo.id}
              className={cn(isMobile && "min-w-[85vw] snap-center")}
              onMouseEnter={() => setHoveredProjectId(repo.id)}
              onMouseLeave={() => setHoveredProjectId(null)}
            >
              <AnimatedCard
                delay={index * 0.05}
                className={cn(
                  "flex flex-col h-full transition-all duration-500",
                  hoveredProjectId === repo.id && "border-primary-themeable/50 scale-[1.02] bg-secondary-themeable"
                )}
              >
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <motion.div
                        className="p-2 bg-secondary-themeable rounded-lg text-primary-themeable shadow-glow-inset-themeable border border-muted-themeable"
                        whileHover={isMobile ? {} : { rotate: 360, scale: 1.1 }}
                      >
                        <repo.icon size={24} />
                      </motion.div>
                      <div className="flex flex-col">
                        <h3 className="text-xl font-bold text-primary-themeable tracking-tight">{repo.name}</h3>
                        {repo.deprecated && (
                          <span className="text-[9px] uppercase tracking-widest text-amber-500 font-black opacity-80">
                            {t('projects.deprecated')}
                          </span>
                        )}
                      </div>
                    </div>
                </div>

                <p className="text-secondary-themeable mb-6 line-clamp-3 flex-grow text-sm leading-relaxed">
                  {t(repo.description)}
                </p>

                <div className="flex flex-wrap gap-2 mb-6">
                  {repo.topics.map(topic => (
                    <motion.span
                      key={topic}
                      whileHover={isMobile ? {} : { scale: 1.1, y: -2 }}
                      className={cn(
                        "text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full border bg-secondary-themeable font-bold transition-all",
                        topicColors[topic] || 'border-muted-themeable text-secondary-themeable'
                      )}
                    >
                      {topic}
                    </motion.span>
                  ))}
                </div>

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-muted-themeable">
                  <div className="flex items-center gap-4">
                    <a
                      href={repo.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-2 text-primary-themeable hover:brightness-125 transition-all font-semibold text-sm"
                    >
                      {t('projects.inspect')} <ExternalLink size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </a>
                  </div>
                </div>
              </AnimatedCard>
            </div>
          );
        })}

        <div className={cn(
          "border border-dashed border-muted-themeable rounded-2xl flex flex-col items-center justify-center p-8 text-center bg-secondary-themeable opacity-40 min-h-[250px]",
          isMobile && "min-w-[85vw] snap-center"
        )}>
          <Terminal size={32} className="text-secondary-themeable/40 mb-4" />
          <p className="text-secondary-themeable italic">{t('projects.future')}</p>
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
    </div>
  );
};
