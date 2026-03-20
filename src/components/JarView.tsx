import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { Star } from 'lucide-react';
import { Rejection } from '../App';

interface JarViewProps {
  rejections: Rejection[];
  count: number;
}

export default function JarView({ rejections, count }: JarViewProps) {
  // Generate random positions for stars inside the jar
  const stars = useMemo(() => {
    return rejections.map((rej, i) => {
      // Jar dimensions roughly: width 256px, height 384px
      // We want stars to be inside the jar bounds
      const x = Math.random() * 180 - 90; // -90 to 90
      const y = Math.random() * 280 - 140; // -140 to 140
      const delay = Math.random() * 2;
      const duration = 3 + Math.random() * 4;
      const xOffset = Math.random() * 20 - 10;
      const yOffset = Math.random() * 20 - 10;
      
      return { id: rej.id, x, y, delay, duration, xOffset, yOffset };
    });
  }, [rejections]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
      transition={{ duration: 1 }}
      className="relative flex flex-col items-center justify-center w-full h-full"
    >
      {/* The Counter */}
      <div className="absolute top-1/4 -translate-y-1/2 z-20 flex flex-col items-center">
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

      {/* The Glass Jar */}
      <div className="relative w-64 h-96 mt-32 z-10">
        {/* Jar Lid */}
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-24 h-6 bg-white/10 border-t border-x border-white/20 rounded-t-lg backdrop-blur-md"></div>
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-28 h-4 bg-white/20 border border-white/30 rounded-sm backdrop-blur-md shadow-lg z-20"></div>
        
        {/* Jar Body */}
        <div className="absolute inset-0 bg-white/5 border-2 border-white/10 rounded-b-3xl rounded-t-xl backdrop-blur-sm shadow-[inset_0_0_40px_rgba(255,255,255,0.05)] overflow-hidden">
          {/* Glass Highlights */}
          <div className="absolute top-0 left-4 w-4 h-full bg-gradient-to-b from-white/20 to-transparent rounded-full blur-[2px]"></div>
          <div className="absolute bottom-4 right-4 w-12 h-12 bg-white/10 rounded-full blur-xl"></div>
          
          {/* Stars Container */}
          <div className="absolute inset-0 flex items-center justify-center">
            {stars.map((star) => (
              <motion.div
                key={star.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ 
                  opacity: [0.6, 1, 0.6],
                  scale: [0.8, 1.1, 0.8],
                  x: [star.x, star.x + star.xOffset, star.x],
                  y: [star.y, star.y + star.yOffset, star.y],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{
                  duration: star.duration,
                  repeat: Infinity,
                  repeatType: "reverse",
                  delay: star.delay,
                  ease: "easeInOut"
                }}
                className="absolute text-yellow-400 drop-shadow-[0_0_12px_rgba(250,204,21,0.8)]"
              >
                <Star size={20} fill="currentColor" strokeWidth={1.5} />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
