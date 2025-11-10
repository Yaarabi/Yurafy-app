'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Home, ArrowRight, SearchX } from 'lucide-react';
import GeometricBackground from '@/components/common/GeometricBackground';

export default function NotFound() {
  return (
    <main className="relative min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center">
      {/* Static background */}
      <GeometricBackground />

      <div className="relative z-10 text-center max-w-3xl mx-auto px-6 py-24">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="p-8 sm:p-12 bg-white dark:bg-gray-950 rounded-2xl"
        >
          {/* Simple icon animation */}
          <motion.div
            animate={{ y: [-6, 6, -6] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="inline-flex items-center justify-center w-24 h-24 mb-6 rounded-2xl bg-gray-100 dark:bg-gray-900"
          >
            <SearchX className="w-12 h-12 text-sky-600" strokeWidth={2.5} />
          </motion.div>

          {/* Clean title */}
          <h1 className="text-5xl sm:text-7xl font-extrabold mb-4 text-gray-900 dark:text-gray-100">
            404
          </h1>

          <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-700 dark:text-gray-300">
            Page Not Found
          </h2>

          {/* Description */}
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-10 max-w-xl mx-auto">
            The page you’re looking for doesn’t exist or has been moved.
          </p>

          {/* Simple buttons */}
          <div className="flex justify-center flex-wrap gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-semibold transition-transform hover:scale-105"
            >
              <Home className="w-5 h-5" />
              <span>Home</span>
            </Link>

            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-sky-600 text-sky-600 hover:bg-sky-50 dark:hover:bg-gray-900 font-semibold transition-transform hover:scale-105"
            >
              <span>Dashboard</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          {/* Footer */}
          <p className="mt-12 text-sm text-gray-500 dark:text-gray-400">
            Powered by <span className="font-semibold text-sky-600">Yurafy</span>
          </p>
        </motion.div>
      </div>
    </main>
  );
}
