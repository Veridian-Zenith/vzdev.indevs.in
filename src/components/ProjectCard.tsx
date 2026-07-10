import { motion } from 'framer-motion';
import { AnimatedCard } from './Common';
import { cn } from '../utils';
import { ExternalLink } from 'lucide-react';

interface ProjectCardProps {
  repo: {
    id: string;
    name: string;
    description: string;
    html_url: string;
    topics: string[];
    language: string;
    icon: any;
  };
  index: number;
  topicColors: Record<string, string>;
}

export const ProjectCard = ({ repo, index, topicColors }: ProjectCardProps) => {
  return (
    <AnimatedCard delay={index * 0.1}>
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
  );
};
