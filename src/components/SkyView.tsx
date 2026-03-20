import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { Rejection } from '../App';

interface SkyViewProps {
  rejections: Rejection[];
}

export default function SkyView({ rejections }: SkyViewProps) {
  // Generate random positions for fireflies across the entire screen
  const fireflies = useMemo(() => {
    return rejections.map((rej) => {
      // Screen dimensions roughly 100vw, 100vh
      const x = Math.random() * 100; // 0 to 100 vw
      const y = Math.random() * 100; // 0 to 100 vh
      const delay = Math.random() * 5;
      const duration = 5 + Math.random() * 10;
      
      return { id: rej.id, x, y, delay, duration };
    });
  }, [rejections]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2 }}
      className="absolute inset-0 z-0 overflow-hidden bg-gradient-to-b from-[#0A192F] to-[#010816]"
    >
      {/* The Shattered Message */}
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 1.5 }}
        className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none"
      >
        <h1 className="text-4xl md:text-6xl font-serif text-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)] mb-4">
          The Jar is Broken
        </h1>
        <p className="text-gray-300 text-lg md:text-xl tracking-wide max-w-xl text-center px-6 leading-relaxed">
          Your courage has transformed into light. <br/>
          Every rejection was a step towards this moment.
        </p>
      </motion.div>

      {/* Fireflies Container */}
      <div className="absolute inset-0 z-10">
        {fireflies.map((firefly) => (
          <motion.div
            key={firefly.id}
            initial={{ 
              opacity: 0, 
              scale: 0,
              left: '50%',
              top: '50%'
            }}
            animate={{ 
              opacity: [0, 1, 0.5, 1, 0],
              scale: [0, 1.5, 1, 1.2, 0],
              left: [`${firefly.x}vw`, `${(firefly.x + Math.random() * 20 - 10)}vw`, `${firefly.x}vw`],
              top: [`${firefly.y}vh`, `${(firefly.y + Math.random() * 20 - 10)}vh`, `${firefly.y}vh`],
            }}
            transition={{
              duration: firefly.duration,
              repeat: Infinity,
              repeatType: "reverse",
              delay: firefly.delay,
              ease: "easeInOut"
            }}
            className="absolute w-1.5 h-1.5 bg-yellow-200 rounded-full shadow-[0_0_15px_rgba(250,204,21,1)]"
          />
        ))}
      </div>
    </motion.div>
  );
}
