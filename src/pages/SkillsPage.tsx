//! License: Open Software License 3.0 (OSL-3.0)
//! Copyright (c) 2026 Dae Euhwa

import { Code, Server, Wrench, Lock, Briefcase, BookOpen, Users, Globe } from 'lucide-react';
import {
  PageHeader, Section, SectionHead, Brackets, BlueprintGrid, SignalFeed,
} from '../components/Forge';
import type { SignalRow } from '../components/Forge';

const CATEGORIES = [
  {
    Icon: Code, fig: 'A', title: 'Systems programming', level: 'primary',
    skills: ['C++ (C++26)', 'C', 'Rust', 'TypeScript', 'Kotlin', 'Lua', 'Linux systems', 'Kernel dev (x86_64)', 'seccomp · capabilities · PAM'],
  },
  {
    Icon: Server, fig: 'B', title: 'Infrastructure', level: 'primary',
    skills: ['Linux administration', 'DNS server management', 'nftables', 'Initramfs generation', 'Wayland / compositor integration', 'CI/CD', 'Infrastructure automation'],
  },
  {
    Icon: Lock, fig: 'C', title: 'Security', level: 'primary',
    skills: ['Privilege enforcement', 'Syscall filtering', 'Capability reduction', 'PAM integration', 'Policy evaluation', 'DNS security', 'QNAME minimisation', 'Defense-in-depth'],
  },
  {
    Icon: Wrench, fig: 'D', title: 'Tools & platforms', level: 'secondary',
    skills: ['Git', 'AUR maintenance', 'Arch Linux', 'Hyprland', 'COSMIC', 'Niri', 'Flutter / Dart', 'React / TypeScript', 'Terminal workflows'],
  },
  {
    Icon: Briefcase, fig: 'E', title: 'Experience', level: 'secondary',
    skills: [
      'Linux administrator — DNS, firewall, system security',
      'Open source contributor — Voix, Galdr, DDS, Heimdallr, Verdandi',
      'Operating system development — Verdandi',
      'Subway sandwich artist / cashier (2022)',
    ],
  },
  {
    Icon: BookOpen, fig: 'F', title: 'Education', level: 'secondary',
    skills: ['Riverside High School (2012–2024)', 'E.A.S.T. Program (2022–2023)'],
  },
];

const RECENT: SignalRow[] = [
  { t: '04:12', e: 'commit', m: 'verdandi — capability manifest enforcement', r: 'verdandi' },
  { t: '03:21', e: 'merge', m: 'heimdallr — qname minimisation gate', r: 'heimdallr' },
  { t: '02:47', e: 'commit', m: 'galdr — parallel module ordering', r: 'galdr' },
  { t: '01:36', e: 'merge', m: 'meshiji — token-driven surface', r: 'meshiji' },
  { t: '00:58', e: 'ci', m: 'codeql advanced — 0 findings on main', r: 'pipeline' },
];

export const SkillsPage = () => {
  return (
    <div className="min-h-screen">
      <PageHeader
        fig="fig. 03 · skills"
        title="Skills & Expertise"
        lede="Technical capabilities forged in the digital void — classified by depth, with the applied signal showing where the practice landed."
      />

      <Section>
        <SectionHead index="fig. 03a" title="Classified" />
        <div className="grid sm:grid-cols-2 gap-4">
          {CATEGORIES.map((c) => (
            <div
              key={c.fig}
              className={`relative bg-black border rounded-2xl overflow-hidden ${
                c.level === 'primary' ? 'border-amber-400/30' : 'border-amber-400/15'
              }`}
            >
              <span className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-amber-400/60 to-transparent" />
              <div className="p-5 sm:p-6">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-400/25 flex items-center justify-center shrink-0">
                    <c.Icon size={18} className="text-amber-300" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[9px] font-mono uppercase tracking-[0.25em] text-amber-400/40">{c.fig}</span>
                    <h3 className="text-sm font-black text-amber-200 tracking-tight">{c.title}</h3>
                  </div>
                  <span className="ml-auto text-[9px] font-mono uppercase tracking-[0.2em] text-amber-400/30 shrink-0">
                    {c.level}
                  </span>
                </div>
                <ul className="mt-5 flex flex-wrap gap-1.5">
                  {c.skills.map((s) => (
                    <li key={s} className="text-[10px] px-2 py-1 rounded border border-amber-400/15 text-amber-100/45 bg-amber-500/[0.04]">
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section className="!pt-0">
        <SectionHead index="fig. 03b" title="Applied signal" />
        <div className="grid lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3">
            <SignalFeed rows={RECENT} />
          </div>

          <div className="lg:col-span-2 space-y-4">
            <div className="relative bg-black border border-amber-400/20 rounded-2xl p-6">
              <Brackets />
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-400/25 flex items-center justify-center">
                  <Globe size={17} className="text-amber-300" />
                </div>
                <h3 className="text-sm font-black text-amber-200 tracking-tight mt-4">Languages</h3>
                <p className="text-xs text-amber-100/40 mt-2">English (fluent)</p>
              </div>
            </div>

            <div className="relative bg-black border border-amber-400/20 rounded-2xl p-6 overflow-hidden">
              <BlueprintGrid />
              <div className="relative flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-400/25 flex items-center justify-center shrink-0">
                  <Users size={17} className="text-amber-300" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-amber-200 tracking-tight">Resume</h3>
                  <a href="/resume.md" download className="text-xs text-amber-100/40 hover:text-amber-300 transition-colors mt-1 inline-block">
                    Download · markdown
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
};
