import { useEffect, useState } from 'react';

const KONAMI_CODE = [
  'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
  'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
  'b', 'a'
];

export const useKonamiCode = () => {
  const [isTriggered, setIsTriggered] = useState(false);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === KONAMI_CODE[index]) {
        setIndex(prev => prev + 1);
        if (index === KONAMI_CODE.length - 1) {
          setIsTriggered(true);
          setIndex(0);
        }
      } else {
        setIndex(0);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [index]);

  return isTriggered;
};
