
import React from 'react';

const TrustItem: React.FC<{ icon: React.ReactNode, title: string, description: string }> = ({ icon, title, description }) => (
    <div className="text-center p-4">
        <div className="flex items-center justify-center h-16 w-16 rounded-full mx-auto mb-4" style={{ backgroundColor: 'var(--primary-color)', color: 'var(--text-color)' }}>
            {icon}
        </div>
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <p className="text-gray-500 text-sm">{description}</p>
    </div>
);

const TrustSection: React.FC = () => {
    return (
        <section className="bg-gray-50 py-16">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <TrustItem 
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 20.917l9 2.5 9-2.5a12.02 12.02 0 00-1.382-9.975z" /></svg>}
                        title="Secure Payments"
                        description="Your transactions are safe with our encrypted payment gateways."
                    />
                    <TrustItem 
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 2h8a1 1 0 001-1zM3 11h10M16 16l4-4m0 0l-4-4m4 4H9" /></svg>}
                        title="Fast Delivery"
                        description="We ship your orders quickly to get them to you as soon as possible."
                    />
                     <TrustItem 
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>}
                        title="High Quality"
                        description="We are committed to providing only the best quality products."
                    />
                </div>
            </div>
        </section>
    );
};

export default TrustSection;
