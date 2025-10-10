

import { motion } from 'framer-motion';

export default function Description(){
    return (
        <section
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16"
        >
            <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-400 bg-clip-text text-transparent drop-shadow-md">
                Explore Our Collection
            </h1>
            <p className="mt-4 text-gray-600 text-lg sm:text-xl max-w-3xl mx-auto">
                Discover elegant, AI-powered, and handcrafted products from Yura’s
                marketplace. All orders support cash on delivery.
            </p>
            </div>

        </section>
    )
}