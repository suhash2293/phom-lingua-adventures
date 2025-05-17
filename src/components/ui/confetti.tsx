
import React, { useEffect, useState } from 'react';
import ReactConfetti from 'react-confetti';
import { useConfettiStore } from '@/stores/confetti';

export const Confetti = () => {
  const { isActive } = useConfettiStore();
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!isActive) return null;

  return (
    <ReactConfetti
      width={windowSize.width}
      height={windowSize.height}
      recycle={false}
      numberOfPieces={500}
      gravity={0.2}
      onConfettiComplete={() => {
        useConfettiStore.getState().reset();
      }}
    />
  );
};
