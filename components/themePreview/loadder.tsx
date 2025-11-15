

const LogoLoader = () => {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-transparent z-[9999]">
            <div
                className="animate-spin rounded-full border-4 border-[var(--brand-blue)] border-t-transparent w-12 h-12"
                aria-label="Loading"
            />
        </div>
    );
};

export default LogoLoader;
