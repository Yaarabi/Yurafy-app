'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Home, ArrowRight, SearchX, Sparkles } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-sky-50 to-blue-50 dark:from-gray-900 dark:via-sky-900/20 dark:to-blue-900/20 flex items-center justify-center px-6 py-24 sm:py-32 lg:px-8">
      <div className="text-center max-w-2xl mx-auto">
        {/* Animated 404 Badge */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: 'spring' }}
          className="inline-flex items-center justify-center mb-8"
        >
          <div className="relative">
            <div className="absolute inset-0 rounded-full blur-xl opacity-50 animate-pulse" style={{ backgroundColor: 'var(--brand-blue)' }}></div>
            <div className="relative text-white text-2xl sm:text-3xl font-extrabold px-8 py-4 rounded-full shadow-lg" style={{ backgroundColor: 'var(--brand-blue)' }}>
              404
            </div>
          </div>
        </motion.div>

        {/* Icon */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-6"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4" style={{ backgroundColor: 'var(--brand-blue)', opacity: 0.1 }}>
            <SearchX className="w-10 h-10" style={{ color: 'var(--brand-blue)' }} />
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-4xl sm:text-6xl font-extrabold text-gray-900 dark:text-white mb-4"
        >
          Page not found
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mt-6 text-lg sm:text-xl leading-8 text-gray-600 dark:text-gray-300 mb-10"
        >
          Sorry, we couldn't find the page you're looking for. The page may have been moved or doesn't exist.
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="flex items-center justify-center gap-4 flex-wrap max-[350px]:flex-col max-[350px]:gap-y-4"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            style={{ backgroundColor: 'var(--brand-blue)' }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          >
            <Home className="w-5 h-5" />
            <span>Go back home</span>
          </Link>
          
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-semibold rounded-xl border-2 transition-all duration-200 shadow-md hover:shadow-lg"
            style={{ borderColor: 'var(--brand-blue)' }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--brand-blue)'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--brand-blue)'}
          >
            <span>Go to Dashboard</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>

        {/* Decorative Elements */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-12 flex items-center justify-center gap-2 text-gray-400 dark:text-gray-600"
        >
          <Sparkles className="w-4 h-4" />
          <span className="text-sm">Powered by Yurafy</span>
          <Sparkles className="w-4 h-4" />
        </motion.div>
      </div>
    </main>
  );
}