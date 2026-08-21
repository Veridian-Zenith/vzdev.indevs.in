import { motion } from 'framer-motion';
import { AnimatedCard } from '../components';
import { useTranslation } from 'react-i18next';
import { Code, Wrench, Globe, Users, Server, Lock, Briefcase, BookOpen } from 'lucide-react';

export const SkillsPage = () => {
  useTranslation();

  const skillCategories = [
    {
      title: "Systems Programming",
      icon: Code,
      skills: [
        "C++ (C++26)",
        "C",
        "Rust",
        "TypeScript",
        "Linux Systems Programming",
        "Security Hardening (seccomp, capabilities, PAM)",
      ],
    },
    {
      title: "DevOps & Infrastructure",
      icon: Server,
      skills: [
        "Linux Administration",
        "DNS Server Management",
        "Network Firewall Configuration (nftables)",
        "Initramfs Generation",
        "CI/CD Pipelines",
        "Infrastructure Automation",
      ],
    },
    {
      title: "Tools & Platforms",
      icon: Wrench,
      skills: [
        "Git Version Control",
        "AUR Package Maintenance",
        "Arch Linux",
        "Hyprland",
        "COSMIC Desktop",
        "Terminal/CLI Workflows",
      ],
    },
    {
      title: "Security",
      icon: Lock,
      skills: [
        "Privilege Enforcement",
        "Syscall Filtering",
        "Capability Reduction",
        "PAM Integration",
        "Policy Evaluation",
        "Defense-in-Depth",
      ],
    },
    {
      title: "Work Experience",
      icon: Briefcase,
      skills: [
        "Subway Sandwich Artist/Cashier (2022) - Multi-station rotation, customer service, inventory",
        "Self-employed Linux Administrator - DNS server, firewall configuration, system security",
        "Open Source Contributor - AUR package maintainer, Voix, Galdr, DDS projects",
      ],
    },
    {
      title: "Education",
      icon: BookOpen,
      skills: [
        "Riverside High School (2012-2024) - Junior High School Education",
        "E.A.S.T. Program (2022-2023) - Physical presence in professional environments",
      ],
    },
    {
      title: "Soft Skills",
      icon: Users,
      skills: [
        "Customer Service",
        "Multi-tasking Across Stations",
        "Physical Stamina & Adaptability",
        "Troubleshooting",
        "Self-directed Learning",
        "Problem Solving",
      ],
    },
    {
      title: "Languages",
      icon: Globe,
      skills: [
        "English (Fluent)",
      ],
    },
  ];

  return (
    <div className="pt-32 pb-24 px-8 max-w-6xl mx-auto min-h-screen relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <h1 className="text-5xl sm:text-7xl font-bold text-primary-themeable mb-6 drop-shadow-[0_0_20px_var(--vz-glow-color)]">
          Skills & Expertise
        </h1>
        <p className="text-secondary-themeable max-w-2xl mx-auto text-xl italic leading-relaxed">
          Technical capabilities forged in the digital void.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {skillCategories.map((category, index) => (
          <AnimatedCard
            key={category.title}
            delay={index * 0.1}
            className="bg-secondary-themeable/60 backdrop-blur-xl border-muted-themeable"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-primary-themeable/10 rounded-xl text-primary-themeable">
                <category.icon size={24} />
              </div>
              <h3 className="text-xl font-bold text-primary-themeable">{category.title}</h3>
            </div>
            <ul className="space-y-3">
              {category.skills.map((skill) => (
                <li key={skill} className="flex items-center gap-3 text-secondary-themeable">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-themeable/50" />
                  {skill}
                </li>
              ))}
            </ul>
          </AnimatedCard>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-16 text-center"
      >
        <a
          href="/resume.md"
          download
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary-themeable/10 hover:bg-primary-themeable/20 border border-primary-themeable/30 rounded-full text-primary-themeable font-bold transition-all"
        >
          Download Resume (Markdown)
        </a>
      </motion.div>
    </div>
  );
};