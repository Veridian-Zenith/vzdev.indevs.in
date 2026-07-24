import { useAtmosphere, atmospheres } from '../hooks';
import { useIsMobile } from '../hooks';
import { motion, AnimatePresence } from 'framer-motion';
import { Cloud } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export function AtmosphereSelector() {
  const { atmosphere, switchAtmosphere } = useAtmosphere();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="flex items-center gap-2 px-4 py-2 sm:px-3 sm:py-1 rounded-full sm:rounded border border-primary-themeable/30 hover:border-primary-themeable hover:bg-primary-themeable/10 transition-all text-sm relative z-50 bg-secondary-themeable/20"
        title={t('atmosphere.title')}
      >
        <Cloud size={16} className="text-primary-themeable" />
        <span className="sm:inline text-primary-themeable font-bold sm:font-normal">{t('atmosphere.title')}</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40 bg-transparent"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: isMobile ? 10 : -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: isMobile ? 10 : -10 }}
              transition={{ duration: 0.15 }}
              className={`absolute right-1/2 translate-x-1/2 sm:translate-x-0 sm:right-0 ${isMobile ? 'bottom-full mb-2' : 'mt-2'} w-64 sm:w-64 bg-secondary-themeable border border-muted-themeable rounded-2xl sm:rounded shadow-2xl z-50 pointer-events-auto backdrop-blur-xl overflow-hidden`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-2 space-y-1">
                {atmospheres.map((atm) => (
                  <button
                    key={atm.id}
                    onClick={() => {
                      switchAtmosphere(atm.id);
                      setIsOpen(false);
                    }}
                    className={`
                      w-full text-left px-3 py-2 rounded text-sm transition-all group
                      ${atmosphere === atm.id
                        ? 'bg-primary-themeable/20 text-primary-themeable border border-primary-themeable/50 shadow-glow-themeable'
                        : 'text-secondary-themeable hover:bg-primary-themeable/10 hover:text-primary-themeable border border-transparent'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0 transition-transform group-hover:scale-125"
                        style={{
                          backgroundColor: atm.color,
                          boxShadow: `0 0 10px ${atm.color}`
                        }}
                      />
                      <div>
                        <div className="font-medium">{t(`atmosphere.${atm.id}.name`)}</div>
                        <div className="text-[10px] uppercase tracking-wider opacity-60 mt-0.5">{t(`atmosphere.${atm.id}.description`)}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
