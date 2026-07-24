//! License: Open Software License 3.0 (OSL-3.0)
//! Copyright (c) 2026 Dae Euhwa

import { useState, useEffect } from "react";

import { motion } from "framer-motion";
import { cn } from "../utils";

const ALL_BOOT_LOGS = [
  "[  0.000000] Initializing Zenith Microkernel v0.4.2-alpha...",
  "[  0.000412] Loading runic memory mapping...",
  "[  0.012834] Mounting /dev/void on root filesystem...",
  "[  0.045102] Establishing connection to Veridian Forge...",
  "[  0.102931] Verifying digital sigils... [OK]",
  "[  0.215842] Synchronizing aether flux coordinates...",
  "[  0.356129] Loading Nordic aesthetics module...",
  "[  0.512843] Initializing spell-check for arcane scripts...",
  "[  0.782103] Calibrating spectral output...",
  "[  1.120492] Stabilizing void aperture... [OK]",
  "[  1.450128] Loading user identity: The Seeker...",
  "[  1.820431] Initializing UI layout components...",
  "[  2.105842] Ready to materialize digital realm.",
  "Welcome to Veridian Zenith OS."
];

type Props = {
  onLoadingComplete: () => void;
};

export const LoadingScreen = ({ onLoadingComplete }: Props) => {
  const [progress, setProgress] = useState(0);
  const [latency, setLatency] = useState<number | null>(null);
  const [bootLogs, setBootLogs] = useState<string[]>([]);
  const [isBooting, setIsBooting] = useState(true);
  const [diagMode, setDiagMode] = useState(0);

  /* ---------------------------------- */
  /* Latency Measurement                */
  /* ---------------------------------- */
  useEffect(() => {
    const start = performance.now();

    fetch(window.location.origin + "/assets/favicon.ico", { mode: "no-cors" })
      .then(() => setLatency(Math.round(performance.now() - start)))
      .catch(() => setLatency(Math.round(Math.random() * 50 + 20)));
  }, []);

  /* ---------------------------------- */
  /* Progress Simulation                */
  /* ---------------------------------- */
  useEffect(() => {
    let logIndex = 0;
    const logInterval = setInterval(() => {
      if (logIndex < ALL_BOOT_LOGS.length) {
        setBootLogs(prev => [...prev, ALL_BOOT_LOGS[logIndex]]);
        logIndex++;
      } else {
        setIsBooting(false);
        clearInterval(logInterval);
      }
    }, 150);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100;
        return Math.min(prev + Math.random() * 10 + 2, 100);
      });
    }, 200);

    const handleLoad = () => setProgress(100);

    if (document.readyState === "complete") handleLoad();
    else window.addEventListener("load", handleLoad);

    return () => {
      clearInterval(logInterval);
      clearInterval(progressInterval);
      window.removeEventListener("load", handleLoad);
    };
  }, []);

  /* ---------------------------------- */
  /* Completion Trigger                 */
  /* ---------------------------------- */
  /* ---------------------------------- */
  /* Completion Trigger                 */
  /* ---------------------------------- */
  const showContinue = progress >= 80 && !isBooting;

  useEffect(() => {
    if (showContinue) {
      const autoContinueTimer = setTimeout(() => {
        onLoadingComplete();
      }, 5000);
      return () => clearTimeout(autoContinueTimer);
    }
  }, [showContinue, onLoadingComplete]);

  const handleContinue = () => {
    onLoadingComplete();
  };

  const [diagValues, setDiagValues] = useState({ lux: 0, dbm: 0, uptime: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      setDiagValues({
        lux: Math.floor(Math.random() * 1000),
        dbm: Math.floor(Math.random() * 90),
        uptime: Math.floor(performance.now() / 1000)
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  /* ---------------------------------- */
  /* Stable Decorative Data             */
  /* ---------------------------------- */
  // Diagnostic hex removed for clean boot look

  const cycleDiagMode = () => {
    setDiagMode((prev) => (prev + 1) % 3);
  };

  const roundedProgress = Math.min(100, Math.round(progress));

  return (
    <div
      className="fixed inset-0 z-[200] bg-primary-themeable flex flex-col items-center justify-center overflow-hidden font-mono"
    >
      {/* CRT Scanlines Overlay */}
      <div className="absolute inset-0 pointer-events-none z-50 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] opacity-30" />
      
      {/* Vignette */}
      <div className="absolute inset-0 pointer-events-none z-40 bg-[radial-gradient(circle,transparent_40%,rgba(0,0,0,0.6)_100%)]" />

      {/* HUD Corners */}
      <div className="absolute top-8 left-8 w-12 h-12 border-t-2 border-l-2 border-primary-themeable/30 pointer-events-none z-10" />
      <div className="absolute top-8 right-8 w-12 h-12 border-t-2 border-r-2 border-primary-themeable/30 pointer-events-none z-10" />
      <div className="absolute bottom-8 left-8 w-12 h-12 border-b-2 border-l-2 border-primary-themeable/30 pointer-events-none z-10" />
      <div className="absolute bottom-8 right-8 w-12 h-12 border-b-2 border-r-2 border-primary-themeable/30 pointer-events-none z-10" />

      {/* Background Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--vz-glow-color)_0%,transparent_70%)] opacity-20 pointer-events-none z-0" />

      {/* Logo Animation */}
      <div className="relative mb-8 z-10">
        <div
          className="w-24 h-24 flex items-center justify-center"
        >
          <motion.img
            src="/assets/brand-image.png"
            alt="Loading Logo"
            className="w-full h-full object-contain drop-shadow-[0_0_20px_var(--vz-glow-color)]"
            animate={{ 
              filter: ["brightness(1)", "brightness(1.5)", "brightness(1)"],
              scale: [1, 1.02, 1]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
          />
        </div>
      </div>

      {/* Boot Terminal */}
      <div className="w-full max-w-lg h-48 overflow-hidden relative px-4 z-10">
        <div className="flex flex-col gap-1 text-xs sm:text-sm text-secondary-themeable/80">
          {bootLogs.map((log, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: i * 0.05 }}
               className={cn(
                 "transition-all duration-300",
                 log?.startsWith('Welcome') ? 'text-primary-themeable font-bold mt-2 drop-shadow-glow-themeable' : 'opacity-80'
               )}
            >
              <span className="text-primary-themeable/40 mr-2">›</span> {log}
            </motion.div>
          ))}
          {isBooting && <div className="w-2 h-4 bg-primary-themeable animate-pulse inline-block" />}
        </div>
      </div>

      {/* Progress Section */}
      <div className="mt-8 flex flex-col items-center gap-3 z-10">
        {showContinue ? (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05, boxShadow: "0 0 20px var(--vz-glow-color)" }}
            whileTap={{ scale: 0.95 }}
            onClick={handleContinue}
            className="px-8 py-3 border border-primary-themeable text-primary-themeable font-bold tracking-widest uppercase hover:bg-primary-themeable hover:text-black transition-all duration-300 relative overflow-hidden group"
          >
            <span className="relative z-10">Enter The Realm</span>
            <motion.div 
              className="absolute inset-0 bg-primary-themeable/20" 
              initial={{ x: '-100%' }} 
              whileHover={{ x: '100%' }} 
              transition={{ duration: 0.5 }} 
            />
          </motion.button>
        ) : (
          <>
            <div className="text-primary-themeable font-bold text-2xl tracking-widest relative">
              <motion.span
                animate={{ opacity: [1, 0.7, 1] }}
                transition={{ duration: 0.1, repeat: Infinity }}
              >
                {roundedProgress}%
              </motion.span>
            </div>
            <div className="w-48 sm:w-64 h-1 bg-secondary-themeable rounded-full overflow-hidden border border-primary-themeable/20">
              <motion.div
                className="h-full bg-gradient-to-r from-primary-themeable via-themeable to-primary-themeable shadow-primary-themeable"
                initial={{ width: 0 }}
                animate={{ width: `${roundedProgress}%` }}
              />
            </div>
          </>
        )}
      </div>

      {/* Diagnostics Panel */}
      <div
        onClick={cycleDiagMode}
        className="absolute bottom-10 right-10 text-right font-mono text-[10px] text-secondary-themeable/40 uppercase tracking-widest leading-relaxed cursor-pointer hover:text-primary-themeable/50 transition-colors select-none group z-10"
      >
        <div className="flex items-center justify-end gap-2">
          <span>
            {diagMode === 0
              ? "Void Latency:"
              : diagMode === 1
                ? "Aether Flux:"
                : "Signal Noise:"}
          </span>
          <span
            className={
              latency && latency < 100
                ? "text-green-500/50"
                : "text-primary-themeable/50"
            }
          >
            {diagMode === 0
              ? latency
                ? `${latency}ms`
                : "Calculating..."
              : diagMode === 1
                ? `${diagValues.lux} lux`
                : `-${diagValues.dbm} dBm`}
          </span>
        </div>

        <div>Engine: React / Vite</div>
        <div>Uptime: {diagValues.uptime}s</div>

        <div className="flex items-center justify-end gap-2 mt-1">
          <div
            className={`w-1.5 h-1.5 rounded-full animate-pulse ${diagMode === 0
                ? "bg-green-500/50"
                : diagMode === 1
                  ? "bg-primary-themeable/50"
                  : "bg-red-500/50"
              }`}
          />
          <span>
            {diagMode === 0
              ? "Zenith Connection Stable"
              : diagMode === 1
                ? "Flux Integrity Nominal"
                : "Void Interference Detected"}
          </span>
        </div>

        <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[7px] text-primary-themeable/30 mt-1">
          Click to toggle diagnostics
        </div>
      </div>
    </div>
  );
};
