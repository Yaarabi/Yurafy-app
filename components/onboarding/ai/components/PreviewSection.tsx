import React from 'react';

interface PreviewSectionProps {
    title: string;
    children: React.ReactNode;
    className?: string;
}

const PreviewSection: React.FC<PreviewSectionProps> = ({ title, children, className = '' }) => {
    return (
        <section className={`space-y-3 ${className}`}>
            <h4 className="text-base font-semibold text-gray-900">{title}</h4>
            <div className="space-y-3">{children}</div>
        </section>
    );
};

export default PreviewSection;
