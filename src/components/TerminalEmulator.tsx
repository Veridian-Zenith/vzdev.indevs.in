import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Terminal as TerminalIcon, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

interface TerminalEmulatorProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TerminalEmulator: React.FC<TerminalEmulatorProps> = ({ isOpen, onClose }) => {
  const { triggerGlitch, setReducedMotion } = useApp();
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>(['Veridian Zenith OS v0.4.2-alpha', 'NOTE: This terminal is a work in progress.', 'Type "help" for a list of commands.']);
  const inputRef = useRef<HTMLInputElement>(null);
  const historyRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (historyRef.current) {
      historyRef.current.scrollTop = historyRef.current.scrollHeight;
    }
  }, [history]);

  const handleCommand = async (cmd: string) => {
    const trimmedCmd = cmd.trim().toLowerCase();
    setHistory(prev => [...prev, `> ${cmd}`]);

    switch (trimmedCmd) {
      case 'help':
        setHistory(prev => [...prev, 'Available commands:', '  help     - Show this help message', '  ls       - List artifacts', '  about    - About the collective', '  clear    - Clear terminal', '  exit     - Close terminal', '  goto <id> - Navigate to artifact page', '  fortune  - Get some runic wisdom', '  whoami   - Display current user identity', '  date     - Show the current temporal coordinates', '  neofetch - System information summary', '  ascii    - Display ASCII art', '  matrix   - Witness the void', '  joke     - A laugh from the abyss', '  glitch   - Trigger a system glitch', '  motion <on|off> - Toggle reduced motion', '  cat <file> - Read a void log']);
        break;
      case 'ascii':
        setHistory(prev => [...prev,
          '    ▲',
          '   ▲ ▲',
          ' ▲ ▲ ▲ ▲',
          '▲ ▲ ▲ ▲ ▲',
          'Veridian Zenith ascends...'
        ]);
        break;
      case 'matrix':
        setHistory(prev => [...prev,
          '█▓▒░ ░▒▓█ Æther flowing ░▒▓█ ░▒░░',
          '░▒▓█ Digital consciousness awakens █▓▒░',
          '█▓▒░ The void recognizes you ░▒▓█'
        ]);
        break;
      case 'joke': {
        const jokes = [
          "Why did the developer go dark mode? Because light mode got too close to the void.",
          "A SQL query walks into a bar, walks up to two tables and asks... can I join you?",
          "How many programmers does it take to change a light bulb? None, that's a hardware problem.",
          "Why do programmers prefer dark mode? Because light attracts bugs.",
          "Why did the code go to the beach? To stabilize its wave function."
        ];
        const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];
        setHistory(prev => [...prev, randomJoke]);
        break;
      }
      case 'fortune': {
        const fortunes = [
          "The runes favor the bold.",
          "Digital artifacts are but echoes of the void.",
          "In Zig we trust, in C we must.",
          "AxiomOS: Stability is an illusion, but we build it anyway.",
          "The Architect is watching.",
          "Nordic winds bring swift performance.",
          "All designs serve a purpose. Minimalism is merely one form.",
          "Function and form dance in harmony within our forge.",
          "The void speaks only to those who listen."
        ];
        const randomFortune = fortunes[Math.floor(Math.random() * fortunes.length)];
        setHistory(prev => [...prev, randomFortune]);
        break;
      }
      case 'whoami':
        setHistory(prev => [...prev, 'The Seeker / guest@zenith-void']);
        break;
      case 'date':
        setHistory(prev => [...prev, new Date().toString()]);
        break;
      case 'neofetch':
        setHistory(prev => [...prev,
          '  /\\   OS: Veridian Zenith OS v0.4.2-alpha',
          ' /  \\  Kernel: Custom Zenith Microkernel',
          '/____\\ Uptime: Infinite',
          '|    | Shell: Zenithsh',
          '|    | Theme: Nordic Void'
        ]);
        break;
      case 'sudo':
        setHistory(prev => [...prev, 'Permission denied. You are not the Architect.']);
        break;
      case 'ls':
        setHistory(prev => [...prev, 'Artifacts:', '  axiomos', '  voix', '  meshiji', '  peguni', '  misc']);
        break;
      case 'about':
        setHistory(prev => [...prev, 'Veridian Zenith: A digital forge where ancient Nordic aesthetics meet cutting-edge performance.']);
        break;
      case 'glitch':
        triggerGlitch();
        setHistory(prev => [...prev, 'System instability triggered.']);
        break;
      case 'clear':
        setHistory([]);
        break;
      case 'exit':
        onClose();
        break;
      default:
        if (trimmedCmd.startsWith('cat ')) {
          const file = trimmedCmd.split(' ')[1];
          try {
            const response = await fetch(`/logs/${file}`);
            if (response.ok) {
              const text = await response.text();
              setHistory(prev => [...prev, ...text.split('\\n')]);
            } else {
              setHistory(prev => [...prev, `File not found: ${file}`]);
            }
          } catch (e) {
            setHistory(prev => [...prev, `Error accessing void log: ${e}`]);
          }
        } else if (trimmedCmd.startsWith('motion ')) {
          const action = trimmedCmd.split(' ')[1];
          if (action === 'on') {
            setReducedMotion(false);
            setHistory(prev => [...prev, 'Animations enabled.']);
          } else if (action === 'off') {
            setReducedMotion(true);
            setHistory(prev => [...prev, 'Reduced motion enabled.']);
          } else {
            setHistory(prev => [...prev, 'Usage: motion <on|off>']);
          }
        } else if (trimmedCmd.startsWith('goto ')) {
          const target = trimmedCmd.split(' ')[1];
          if (['axiomos', 'voix', 'meshiji', 'peguni', 'misc'].includes(target)) {
            setHistory(prev => [...prev, `Navigating to ${target}...`]);
            setTimeout(() => {
              navigate('/projects');
              onClose();
            }, 1000);
          } else {
            setHistory(prev => [...prev, `Unknown artifact: ${target}`]);
          }
        } else if (trimmedCmd !== '') {
          setHistory(prev => [...prev, `Command not found: ${trimmedCmd}`]);
        }
    }
    setInput('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            className="w-full max-w-2xl bg-secondary-themeable border border-muted-themeable rounded-xl overflow-hidden terminal-custom-shadow backdrop-blur-2xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Terminal Header */}
            <div className="bg-primary-themeable/10 px-4 py-2 flex items-center justify-between border-b border-muted-themeable/20">
              <div className="flex items-center gap-2">
                <TerminalIcon size={14} className="text-primary-themeable" />
                <span className="text-[10px] uppercase tracking-widest text-primary-themeable/70 font-bold">Zenith Terminal</span>
              </div>
              <button onClick={onClose} className="text-secondary-themeable hover:text-primary-themeable transition-colors">
                <X size={16} />
              </button>
            </div>

            {/* Terminal Body */}
            <div className="p-4 h-80 flex flex-col">
              <div ref={historyRef} className="flex-grow overflow-y-auto font-mono text-sm text-secondary-themeable space-y-1 mb-4 scrollbar-hide">
                {history.map((line, i) => (
                   <div key={i} className={line?.startsWith('>') ? 'text-primary-themeable' : ''}>
                    {line}
                  </div>
                ))}
              </div>
              <form
                onSubmit={e => {
                  e.preventDefault();
                  handleCommand(input);
                }}
                className="flex items-center gap-2 border-t border-muted-themeable/10 pt-4"
              >
                <ChevronRight size={16} className="text-primary-themeable animate-pulse" />
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  className="flex-grow bg-transparent border-none outline-none font-mono text-sm text-primary-themeable"
                  placeholder="Invoke command..."
                />
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
