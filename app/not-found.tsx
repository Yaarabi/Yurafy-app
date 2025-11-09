'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Home, ArrowRight, SearchX, Sparkles } from 'lucide-react';
import GeometricBackground from '@/components/common/GeometricBackground';

export default function GlobalNotFound() {
  return (
    <html lang="en">
      <body>
        <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-50 via-sky-50 to-cyan-50 dark:from-gray-950 dark:via-blue-950/30 dark:to-gray-900">
          {/* Animated Background with Geometric Shapes */}
          <GeometricBackground />

          {/* Content */}
          <div className="relative z-10 flex items-center justify-center min-h-screen px-6 py-24 sm:py-32">
            <div className="text-center max-w-3xl mx-auto">
              {/* Glass Card Container */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 rounded-3xl shadow-2xl border border-white/20 dark:border-gray-800/50 p-8 sm:p-12"
              >
                {/* Animated 404 Badge */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ 
                    duration: 0.8, 
                    type: 'spring',
                    bounce: 0.5
                  }}
                  className="inline-flex items-center justify-center mb-8"
                >
                  <div className="relative">
                    {/* Glow Effect */}
                    <motion.div
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 0.8, 0.5],
                      }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="absolute -inset-4 bg-gradient-to-r from-[#0ea5e9] via-cyan-400 to-blue-500 rounded-full blur-2xl"
                    />
                    {/* Badge */}
                    <div className="relative bg-gradient-to-br from-[#0ea5e9] via-cyan-500 to-blue-600 text-white text-6xl sm:text-7xl font-black px-12 py-6 rounded-2xl shadow-2xl transform hover:scale-105 transition-transform">
                      404
                    </div>
                  </div>
                </motion.div>

                {/* Icon with Floating Animation */}
                <motion.div
                  initial={{ y: -30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                >
                  <motion.div
                    animate={{ y: [-5, 5, -5] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-gradient-to-br from-[#0ea5e9]/20 to-cyan-500/20 backdrop-blur-sm mb-6 border border-[#0ea5e9]/30"
                  >
                    <SearchX className="w-12 h-12 text-[#0ea5e9]" strokeWidth={2.5} />
                  </motion.div>
                </motion.div>

                {/* Title with Gradient */}
                <motion.h1
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="text-5xl sm:text-7xl font-black mb-6 bg-gradient-to-r from-[#0ea5e9] via-cyan-500 to-blue-600 bg-clip-text text-transparent"
                >
                  Page Not Found
                </motion.h1>

                {/* Description */}
                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                  className="text-lg sm:text-xl leading-relaxed text-gray-700 dark:text-gray-300 mb-10 max-w-2xl mx-auto"
                >
                  Oops! The page you're looking for seems to have wandered off. 
                  Don't worry, we'll help you get back on track.
                </motion.p>

                {/* Action Buttons */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                  className="flex items-center justify-center gap-4 flex-wrap"
                >
                  <Link
                    href="/"
                    className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#0ea5e9] to-cyan-500 hover:from-[#0ea5e9] hover:to-blue-600 text-white font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-[#0ea5e9]/50 transform hover:scale-105 hover:-translate-y-1"
                  >
                    <Home className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                    <span>Go Back Home</span>
                  </Link>
                  
                  <Link
                    href="/dashboard"
                    className="group inline-flex items-center gap-3 px-8 py-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 text-[#0ea5e9] font-bold rounded-xl border-2 border-[#0ea5e9] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 hover:-translate-y-1"
                  >
                    <span>Go to Dashboard</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </motion.div>

                {/* Decorative Footer */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                  className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center justify-center gap-3 text-gray-500 dark:text-gray-400">
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    >
                      <Sparkles className="w-5 h-5 text-[#0ea5e9]" />
                    </motion.div>
                    <span className="text-sm font-medium">Powered by <span className="font-bold text-[#0ea5e9]">Yurafy</span></span>
                    <motion.div
                      animate={{ rotate: [360, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    >
                      <Sparkles className="w-5 h-5 text-[#0ea5e9]" />
                    </motion.div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
