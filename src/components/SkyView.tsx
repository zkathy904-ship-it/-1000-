import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { Star } from 'lucide-react';
import { Rejection } from '../App';

interface SkyViewProps {
  rejections: Rejection[];
  count: number;
}

export default function SkyView({ rejections, count }: SkyViewProps) {
  // Generate random positions for fireflies across the entire screen
  const fireflies = useMemo(() => {
    return rejections.map((rej) => {
      // Screen dimensions roughly 100vw, 100vh
      const x = Math.random() * 100; // 0 to 100 vw
      const y = Math.random() * 100; // 0 to 100 vh
      const delay = Math.random() * 5;
      const duration = 5 + Math.random() * 10;
      const xOffset = Math.random() * 20 - 10;
      const yOffset = Math.random() * 20 - 10;
      
      return { id: rej.id, x, y, delay, duration, xOffset, yOffset };
    });
  }, [rejections]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2 }}
      className="absolute inset-0 z-0 overflow-hidden bg-gradient-to-b from-[#0A192F] to-[#010816]"
    >
      {/* The Counter */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center">
        <motion.h1 
          key={count}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-8xl md:text-9xl font-serif text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]"
        >
          {count}
        </motion.h1>
        <p className="text-gray-400 tracking-widest uppercase text-sm mt-4">Rejections</p>
      </div>

      {/* The Shattered Message */}
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: [0, 1, 1, 0], y: [50, 0, 0, -20] }}
        transition={{ duration: 6, times: [0, 0.1, 0.8, 1], delay: 1 }}
        className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none mt-32"
      >
        <h1 className="text-4xl md:text-6xl font-serif text-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)] mb-4">
          The Jar is Broken
        </h1>
        <p className="text-gray-300 text-lg md:text-xl tracking-wide max-w-xl text-center px-6 leading-relaxed">
          Your courage has transformed into light. <br/>
          The jar is gone, but your journey continues. The sky is the limit.
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
              left: [`${firefly.x}vw`, `${firefly.x + firefly.xOffset}vw`, `${firefly.x}vw`],
              top: [`${firefly.y}vh`, `${firefly.y + firefly.yOffset}vh`, `${firefly.y}vh`],
              rotate: [0, 45, -45, 0]
            }}
            transition={{
              duration: firefly.duration,
              repeat: Infinity,
              repeatType: "reverse",
              delay: firefly.delay,
              ease: "easeInOut"
            }}
            className="absolute text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,1)]"
          >
            <Star size={16} fill="currentColor" strokeWidth={1.5} />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
