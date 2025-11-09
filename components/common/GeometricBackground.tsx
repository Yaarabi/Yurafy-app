'use client';

import { motion } from 'framer-motion';

export default function GeometricBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Gradient Blobs */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 90, 0],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute -top-40 -right-40 w-96 h-96 bg-[#0ea5e9] rounded-full blur-3xl"
      />
      <motion.div
        animate={{
          scale: [1.2, 1, 1.2],
          rotate: [90, 0, 90],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="absolute -bottom-40 -left-40 w-96 h-96 bg-cyan-400 rounded-full blur-3xl"
      />
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.3, 0.2],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-300 rounded-full blur-3xl"
      />

      {/* Geometric Decorations */}
      {/* Floating Circles */}
      <motion.div
        animate={{
          y: [0, -30, 0],
          x: [0, 20, 0],
          rotate: [0, 180, 360],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-20 left-[10%] w-16 h-16 border-4 border-[#0ea5e9]/30 rounded-full"
      />
      <motion.div
        animate={{
          y: [0, 40, 0],
          x: [0, -15, 0],
          rotate: [360, 180, 0],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-32 right-[15%] w-24 h-24 border-4 border-cyan-400/30 rounded-full"
      />

      {/* Floating Squares */}
      <motion.div
        animate={{
          rotate: [0, 90, 180, 270, 360],
          scale: [1, 1.2, 1],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute top-1/4 right-[20%] w-20 h-20 border-4 border-blue-500/30 rounded-lg"
      />
      <motion.div
        animate={{
          rotate: [360, 270, 180, 90, 0],
          y: [0, -20, 0],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-1/4 left-[15%] w-16 h-16 bg-gradient-to-br from-[#0ea5e9]/20 to-cyan-500/20 rounded-lg backdrop-blur-sm"
      />

      {/* Floating Triangles */}
      <motion.div
        animate={{
          rotate: [0, 120, 240, 360],
          y: [0, -25, 0],
        }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/3 left-[8%] w-0 h-0 border-l-[30px] border-l-transparent border-r-[30px] border-r-transparent border-b-[52px] border-b-[#0ea5e9]/30"
      />
      <motion.div
        animate={{
          rotate: [360, 240, 120, 0],
          x: [0, 30, 0],
        }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-2/3 right-[12%] w-0 h-0 border-l-[25px] border-l-transparent border-r-[25px] border-r-transparent border-b-[43px] border-b-cyan-400/30"
      />

      {/* Hexagons */}
      <motion.div
        animate={{
          rotate: [0, 60, 120, 180, 240, 300, 360],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
        className="absolute top-[15%] right-[8%]"
      >
        <div className="relative w-14 h-16">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0ea5e9]/20 to-blue-500/20 backdrop-blur-sm"
               style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }} />
        </div>
      </motion.div>
      <motion.div
        animate={{
          rotate: [360, 300, 240, 180, 120, 60, 0],
          y: [0, 20, 0],
        }}
        transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-[20%] left-[12%]"
      >
        <div className="relative w-12 h-14">
          <div className="absolute inset-0 border-4 border-cyan-400/30"
               style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }} />
        </div>
      </motion.div>

      {/* Small Dots/Particles */}
      <motion.div
        animate={{
          y: [0, -100, 0],
          opacity: [0.3, 0.7, 0.3],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[40%] left-[5%] w-3 h-3 bg-[#0ea5e9] rounded-full"
      />
      <motion.div
        animate={{
          y: [0, 80, 0],
          opacity: [0.4, 0.8, 0.4],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute top-[60%] right-[8%] w-4 h-4 bg-cyan-400 rounded-full"
      />
      <motion.div
        animate={{
          x: [0, 60, 0],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-[35%] right-[25%] w-2 h-2 bg-blue-500 rounded-full"
      />

      {/* Additional Corner Decorations */}
      <motion.div
        animate={{
          rotate: [0, 360],
          scale: [1, 1.3, 1],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[10%] left-[25%] w-8 h-8 border-2 border-[#0ea5e9]/40 rounded"
      />
      <motion.div
        animate={{
          rotate: [360, 0],
          x: [0, 20, 0],
        }}
        transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[15%] right-[20%] w-6 h-6 bg-cyan-400/30 rounded-full"
      />
    </div>
  );
}
