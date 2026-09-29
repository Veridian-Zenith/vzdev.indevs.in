//! License: Open Software License 3.0 (OSL-3.0)
//! Copyright (c) 2026 Dae Euhwa

import type { ReactNode } from 'react';

export const BlueprintGrid = ({ className = '' }: { className?: string }) => (
  <div
    className={`absolute inset-0 opacity-[0.07] pointer-events-none ${className}`}
    style={{
      backgroundImage:
        'linear-gradient(rgba(255,179,71,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,179,71,0.6) 1px, transparent 1px)',
      backgroundSize: '28px 28px',
    }}
  />
);

export const Brackets = () => (
  <>
    <span className="absolute top-4 left-4 w-5 h-5 border-t-2 border-l-2 border-amber-400/60" />
    <span className="absolute top-4 right-4 w-5 h-5 border-t-2 border-r-2 border-amber-400/60" />
    <span className="absolute bottom-4 left-4 w-5 h-5 border-b-2 border-l-2 border-amber-400/60" />
    <span className="absolute bottom-4 right-4 w-5 h-5 border-b-2 border-r-2 border-amber-400/60" />
  </>
);

export const TopRule = () => (
  <span className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-amber-400/60 to-transparent" />
);

export const SectionHead = ({ index, title }: { index: string; title: string }) => (
  <div className="flex items-center gap-4 mb-8">
    <span className="text-[9px] font-mono uppercase tracking-[0.25em] text-amber-400/50">{index}</span>
    <h2 className="text-xs font-black uppercase tracking-[0.3em] text-amber-300">{title}</h2>
    <span className="h-px flex-1 bg-gradient-to-r from-amber-400/30 to-transparent" />
  </div>
);

export const SpecList = ({ items }: { items: [string, string][] }) => (
  <dl className="grid grid-cols-2 sm:grid-cols-4 gap-5">
    {items.map(([k, v]) => (
      <div key={k}>
        <dt className="text-[9px] font-mono uppercase tracking-[0.2em] text-amber-400/40">{k}</dt>
        <dd className="text-xs font-mono text-amber-200/90 mt-1.5 break-words">{v}</dd>
      </div>
    ))}
  </dl>
);

export type SignalRow = { t: string; e: string; m: string; r: string };

export const SignalFeed = ({ rows }: { rows: SignalRow[] }) => (
  <ol className="relative pl-6 sm:pl-7">
    <span className="absolute left-0 top-2 bottom-2 w-px bg-gradient-to-b from-amber-400/50 via-amber-400/15 to-transparent" />
    {rows.map((row) => (
      <li key={row.t + row.m} className="relative pb-6 last:pb-0">
        <span className="absolute -left-6 sm:-left-7 top-1.5 w-2 h-2 rounded-full bg-amber-400/70 ring-4 ring-black" />
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1.5">
          <span className="text-[10px] font-mono text-amber-400/50">{row.t}</span>
          <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-amber-300/60 border border-amber-400/25 rounded px-1.5 py-0.5">
            {row.e}
          </span>
        </div>
        <p className="text-sm text-amber-100/55 mt-2 leading-relaxed">{row.m}</p>
        <p className="text-[10px] font-mono text-amber-400/30 mt-1">{row.r}</p>
      </li>
    ))}
  </ol>
);

export const PageHeader = ({ fig, title, lede, children }: { fig: string; title: string; lede: string; children?: ReactNode }) => (
  <header className="relative overflow-hidden border-b border-amber-400/10">
    <BlueprintGrid />
    <div className="relative mx-auto w-full max-w-5xl px-6 sm:px-8 pt-32 pb-14">
      <span className="text-[9px] font-mono uppercase tracking-[0.25em] text-amber-400/50">{fig}</span>
      <h1 className="mt-4 text-4xl sm:text-6xl font-black tracking-tighter leading-[0.95] text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-amber-400 to-amber-700">
        {title}
      </h1>
      <p className="mt-5 text-sm sm:text-base text-amber-100/45 max-w-xl leading-relaxed">{lede}</p>
      {children}
    </div>
  </header>
);

export const Section = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <section className={`mx-auto w-full max-w-5xl px-6 sm:px-8 py-20 ${className}`}>{children}</section>
);

export const Specimen = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <div className={`relative bg-black border border-amber-400/20 rounded-2xl overflow-hidden ${className}`}>
    <Brackets />
    <BlueprintGrid />
    <div className="relative">{children}</div>
  </div>
);

export const Panel = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <div className={`relative bg-black border border-amber-400/20 rounded-2xl overflow-hidden ${className}`}>
    <TopRule />
    {children}
  </div>
);

export const fieldClass =
  'w-full px-4 py-3 bg-black border border-amber-400/25 rounded-xl text-amber-200 placeholder-amber-100/25 focus:outline-none focus:border-amber-400/60 focus:shadow-[0_0_15px_rgba(255,179,71,0.15)] transition-all text-sm font-medium';

export const labelClass = 'block text-[10px] font-mono uppercase tracking-[0.2em] text-amber-400/50 mb-2';

export const PillButton = ({
  children,
  href,
  variant = 'ghost',
  className = '',
}: {
  children: ReactNode;
  href: string;
  variant?: 'solid' | 'ghost';
  className?: string;
}) => (
  <a
    href={href}
    className={`inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full font-bold text-sm transition-all ${
      variant === 'solid'
        ? 'bg-amber-500 hover:bg-amber-400 text-black hover:shadow-[0_0_30px_rgba(255,179,71,0.35)]'
        : 'border border-amber-400/25 text-amber-100/50 hover:text-amber-300 hover:border-amber-400/50'
    } ${className}`}
  >
    {children}
  </a>
);
