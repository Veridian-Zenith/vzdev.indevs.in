//! License: Open Software License 3.0 (OSL-3.0)
//! Copyright (c) 2026 Dae Euhwa

import { motion } from 'framer-motion';
import { AnimatedCard } from '../components/Common';
import { Shield, Hammer, BookOpen } from 'lucide-react';

export const AboutPage = () => {
  return (
    <div className="pt-32 pb-24 px-8 max-w-5xl mx-auto min-h-screen relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <h1 className="text-5xl sm:text-7xl font-bold text-primary-themeable mb-6 drop-shadow-[0_0_20px_var(--vz-glow-color)]">
          The Nordic Zenith
        </h1>
        <p className="text-secondary-themeable max-w-2xl mx-auto text-xl italic leading-relaxed">
          "Where ancient craftsmanship meets digital excellence."
        </p>
      </motion.div>

      <div className="grid grid-cols-1 gap-12">
        <AnimatedCard className="bg-secondary-themeable/60 backdrop-blur-xl border-muted-themeable">
          <div className="flex items-start gap-6">
            <div className="hidden sm:flex p-4 bg-primary-themeable/10 rounded-2xl text-primary-themeable">
              <Hammer size={40} />
            </div>
            <div className="prose prose-invert lg:prose-xl max-w-none">
               <h2 className="text-3xl font-bold text-primary-themeable mb-4">Our Digital Forge</h2>
               <p className="text-secondary-themeable leading-relaxed text-lg">
                 Veridian Zenith is more than a collective—it is a digital forge. We operate in the spectral intersection
                 of ancient Nordic aesthetics and cutting-edge performance. Our focus lies in forging systems that
                 are as resilient as runestones and as fluid as the æther.
               </p>
            </div>
          </div>
        </AnimatedCard>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <AnimatedCard className="bg-secondary-themeable/60 backdrop-blur-xl border-muted-themeable">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4 text-primary-themeable">
                <Shield size={28} />
                <h3 className="text-2xl font-bold text-primary-themeable">The Philosophy</h3>
              </div>
              <p className="text-secondary-themeable leading-relaxed">
                Every line of code is intentional. Like runes carved into stone, our software is built for
                permanence, clarity, and uncompromising speed. We believe in the "Nordic Way"—minimalist,
                effective, and powerful.
              </p>
            </div>
          </AnimatedCard>

          <AnimatedCard className="bg-secondary-themeable/60 backdrop-blur-xl border-muted-themeable">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4 text-primary-themeable">
                <BookOpen size={28} />
                <h3 className="text-2xl font-bold text-primary-themeable">The License</h3>
              </div>
              <p className="text-secondary-themeable leading-relaxed">
                We believe in the sanctity of open source. Veridian Zenith artifacts are released under
                the <a href="https://opensource.org/licenses/OSL-3.0" target="_blank" rel="noopener noreferrer" className="text-primary-themeable hover:underline font-bold">Open Software License 3.0</a>,
                ensuring the code remains free and accessible to all who seek it.
              </p>
            </div>
          </AnimatedCard>
        </div>
      </div>
    </div>
  );
};
