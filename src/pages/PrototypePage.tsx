import { ArrowUpRight, Shield, Terminal, Music, Cog } from 'lucide-react';

export const PrototypePage = () => {
  return (
    <div className="min-h-screen bg-black text-amber-400 px-6 sm:px-12 py-24 space-y-32 selection:bg-amber-400/20 relative overflow-hidden">
      <header className="max-w-5xl mx-auto relative z-10">
        <h1 className="text-4xl sm:text-6xl md:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-amber-300 via-amber-500 to-amber-700 drop-shadow-[0_0_40px_rgba(255,179,71,0.3)] leading-[0.9]">
          Design Prototypes
        </h1>
        <p className="mt-6 text-amber-100/50 text-base sm:text-lg max-w-xl">
          Four directions built on pure black, gold/amber accents, responsive sizing, and GSAP animations. Pick one to expand site-wide.
        </p>
      </header>

      {/* Variant A — Glass Card */}
      <section className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <h2 className="text-xs font-black uppercase tracking-[0.3em] text-amber-400">Variant A — Glass Card</h2>
        </div>
        <div className="relative rounded-3xl overflow-hidden border border-amber-400/20 backdrop-blur-2xl bg-gradient-to-br from-amber-500/[0.04] to-red-600/[0.04] p-8 sm:p-12 shadow-[0_0_60px_rgba(255,179,71,0.08)]">
          <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-start">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-400/30 flex items-center justify-center shadow-[inset_0_0_20px_rgba(255,179,71,0.15)] shrink-0">
              <Shield size={32} className="text-amber-300" />
            </div>
            <div className="space-y-4">
              <h3 className="text-2xl sm:text-3xl font-black text-amber-200 tracking-tight">Privilege Enforcement</h3>
              <p className="text-amber-100/50 text-sm sm:text-base leading-relaxed max-w-lg">
                A secure privilege management tool featuring PAM authentication, minimal attack surface, and modern resolver architecture built in Rust.
              </p>
              <a href="#" className="inline-flex items-center gap-2 mt-4 px-6 py-2.5 rounded-full bg-amber-500/10 hover:bg-amber-500/20 border border-amber-400/30 text-amber-300 font-bold text-sm transition-all hover:scale-[1.03] hover:shadow-[0_0_15px_rgba(255,179,71,0.2)]">Inspect <ArrowUpRight size={14} /></a>
            </div>
          </div>
        </div>
      </section>

      {/* Variant B — Sharp Block */}
      <section className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
          <h2 className="text-xs font-black uppercase tracking-[0.3em] text-red-300">Variant B — Sharp Block</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="rounded-none bg-black border-2 border-amber-400/40 p-8 sm:p-10 shadow-[8px_8px_0px_0px_rgba(255,179,71,0.15)] hover:shadow-[12px_12px_0px_0px_rgba(255,179,71,0.25)] transition-shadow">
            <div className="w-12 h-12 rounded-none bg-amber-500/10 border border-amber-400/40 flex items-center justify-center mb-6 shadow-[inset_0_0_10px_rgba(255,179,71,0.2)]">
              <Terminal size={22} className="text-amber-300" />
            </div>
            <h3 className="text-2xl font-black text-amber-200 tracking-tight mb-3">WuMing</h3>
            <p className="text-amber-100/50 text-sm leading-relaxed">A simple ClamAV GUI frontend written in C using GTK4/LibAdwaita. Sharp lines, zero blur, pure function.</p>
          </div>
          <div className="rounded-none bg-black border-2 border-red-400/30 p-8 sm:p-10 shadow-[8px_8px_0px_0px_rgba(220,38,56,0.15)] hover:shadow-[12px_12px_0px_0px_rgba(220,38,56,0.25)] transition-shadow">
            <div className="w-12 h-12 rounded-none bg-red-500/10 border border-red-400/40 flex items-center justify-center mb-6 shadow-[inset_0_0_10px_rgba(220,38,56,0.2)]">
              <Music size={22} className="text-red-300" />
            </div>
            <h3 className="text-2xl font-black text-amber-200 tracking-tight mb-3">Ljod</h3>
            <p className="text-amber-100/50 text-sm leading-relaxed">Forged sound, open forge. A music and audio project built for the void. No gradients, just form.</p>
          </div>
        </div>
      </section>

      {/* Variant C — Gold Bar */}
      <section className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="w-2 h-2 rounded-full bg-amber-300 animate-pulse" />
          <h2 className="text-xs font-black uppercase tracking-[0.3em] text-amber-200">Variant C — Gold Bar</h2>
        </div>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-black via-[#0a0600] to-black border border-amber-400/20 shadow-[0_0_80px_rgba(255,179,71,0.08)]">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-400/60 to-transparent" />
          <div className="p-8 sm:p-10 md:p-14 space-y-6">
            <h3 className="text-3xl sm:text-4xl md:text-5xl font-black text-amber-200 tracking-tighter">Dynamic Artifacts</h3>
            <p className="text-amber-100/50 text-base sm:text-lg max-w-2xl leading-relaxed">
              Each project is an active entity. The gold bar separates the title from the description with a sharp horizontal glow, emphasizing hierarchy without noise.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              {['C++', 'Rust', 'Dart', 'C', 'Lua', 'TypeScript'].map((tag) => (
                <span key={tag} className="px-4 py-1.5 rounded-full border border-amber-400/20 text-amber-300 text-xs font-bold uppercase tracking-wider bg-amber-500/5 hover:bg-amber-500/10 transition-colors">{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Variant E — Hybrid (Glass + Gold Bar) */}
      <section className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="w-2 h-2 rounded-full bg-amber-200 animate-pulse" />
          <h2 className="text-xs font-black uppercase tracking-[0.3em] text-amber-200">Variant E — Hybrid (Glass + Gold Bar)</h2>
        </div>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500/[0.06] to-red-600/[0.03] border border-amber-400/25 backdrop-blur-xl p-8 sm:p-12 shadow-[0_0_70px_rgba(255,179,71,0.1)]">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-400/40 flex items-center justify-center shadow-[inset_0_0_20px_rgba(255,179,71,0.15)] shrink-0">
              <Cog size={28} className="text-amber-300" />
            </div>
            <div className="space-y-3">
              <h3 className="text-xl sm:text-2xl font-black text-amber-200 tracking-tight">Hybrid Forge</h3>
              <p className="text-sm sm:text-base text-amber-100/50 leading-relaxed max-w-xl">Glass transparency with sharp gold hierarchy. No noise, just structure and glow.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Variant F — Dense Editorial */}
      <section className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="w-2 h-2 rounded-full bg-red-300 animate-pulse" />
          <h2 className="text-xs font-black uppercase tracking-[0.3em] text-red-200">Variant F — Dense Editorial</h2>
        </div>
        <div className="p-8 sm:p-12 bg-black border border-amber-400/20 rounded-3xl shadow-[0_0_40px_rgba(255,179,71,0.05)]">
          <div className="space-y-6 max-w-3xl">
            <h3 className="text-3xl sm:text-4xl md:text-6xl font-black text-amber-200 tracking-tighter leading-[0.9]">
              Forged in <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-red-400">void</span>
            </h3>
            <p className="text-sm sm:text-base text-amber-100/40 leading-loose border-l-2 border-amber-400/30 pl-5">
              Minimal text, maximum impact. Large editorial typography anchored by thin gold rules. No cards, no containers — just raw form.
            </p>
          </div>
        </div>
      </section>

      {/* Variant G — Interactive Grid */}
      <section className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <h2 className="text-xs font-black uppercase tracking-[0.3em] text-amber-400">Variant G — Interactive Grid</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { title: 'Security', desc: 'Privilege enforcement and syscall filtering.', tag: 'System' },
            { title: 'Sound', desc: 'Forged audio tools for the digital void.', tag: 'Audio' },
            { title: 'Explorer', desc: 'Linux-only file management.', tag: 'UI' },
          ].map((item) => (
            <a key={item.title} href="#" className="group relative block bg-black border border-amber-400/15 rounded-2xl p-6 hover:border-amber-400/50 transition-all hover:-translate-y-1 hover:shadow-[0_0_25px_rgba(255,179,71,0.15)]">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-400/50 mb-4 block">{item.tag}</span>
              <h4 className="text-xl font-black text-amber-200 tracking-tight mb-2">{item.title}</h4>
              <p className="text-xs text-amber-100/40 leading-relaxed">{item.desc}</p>
            </a>
          ))}
        </div>
      </section>

      {/* Variant D — Grid Rune */}
      <section className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          <h2 className="text-xs font-black uppercase tracking-[0.3em] text-amber-300">Variant D — Grid Rune</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: 'Galdr', desc: 'Minimal initramfs generator.', icon: Cog },
            { title: 'Voix', desc: 'Privilege management forged in C++26.', icon: Shield },
            { title: 'Meshiji', desc: 'Linux-only file explorer in Flutter.', icon: Terminal },
            { title: 'DDS', desc: 'Dynamic Discord presence.', icon: ArrowUpRight },
          ].map((item) => (
            <a key={item.title} href="#" className="group relative block bg-black border border-amber-400/15 rounded-2xl p-6 hover:border-amber-400/40 transition-all hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(255,179,71,0.15)]">
              <item.icon size={20} className="text-amber-300 mb-4 group-hover:text-amber-200 transition-colors" />
              <h4 className="text-base font-black text-amber-200 tracking-tight mb-2">{item.title}</h4>
              <p className="text-xs text-amber-100/40 leading-relaxed">{item.desc}</p>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
};
