export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">404</h1>
                <p className="text-gray-600 dark:text-gray-400 mb-8">Product not found</p>
                <a
                    href="/"
                    className="px-4 py-2 bg-[var(--brand-blue)] text-white rounded-lg hover:bg-[var(--brand-blue)]/90 transition-colors"
                >
                    Go to Store
                </a>
            </div>
        </div>
    );
}

