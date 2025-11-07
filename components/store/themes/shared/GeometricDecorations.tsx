import React from 'react';

interface GeometricDecorationsProps {
    type: 'circuit' | 'elegant' | 'floral' | 'organic' | 'tech' | 'cultural' | 'food' | 'playful' | 'wellness' | 'professional';
    color: string;
    className?: string;
}

const GeometricDecorations: React.FC<GeometricDecorationsProps> = ({ type, color, className = '' }) => {
    const opacity = 0.1;
    const strokeOpacity = 0.3;

    // Circuit pattern for Electronics
    if (type === 'circuit') {
        return (
            <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
                <svg className="w-full h-full" viewBox="0 0 400 400" preserveAspectRatio="none">
                    <defs>
                        <pattern id="circuit" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                            <path d="M0,50 L100,50 M50,0 L50,100 M20,20 L80,80 M80,20 L20,80" 
                                  stroke={color} strokeWidth="2" fill="none" opacity={strokeOpacity} />
                            <circle cx="50" cy="50" r="3" fill={color} opacity={opacity * 2} />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#circuit)" />
                </svg>
            </div>
        );
    }

    // Elegant geometric patterns for Fashion
    if (type === 'elegant') {
        return (
            <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
                <svg className="w-full h-full" viewBox="0 0 400 400" preserveAspectRatio="none">
                    <defs>
                        <pattern id="elegant" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
                            <polygon points="40,0 80,40 40,80 0,40" fill="none" stroke={color} strokeWidth="1.5" opacity={strokeOpacity} />
                            <circle cx="40" cy="40" r="15" fill="none" stroke={color} strokeWidth="1" opacity={opacity * 2} />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#elegant)" />
                </svg>
            </div>
        );
    }

    // Floral patterns for Beauty
    if (type === 'floral') {
        return (
            <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
                <svg className="w-full h-full" viewBox="0 0 400 400" preserveAspectRatio="none">
                    <defs>
                        <pattern id="floral" x="0" y="0" width="120" height="120" patternUnits="userSpaceOnUse">
                            <circle cx="60" cy="60" r="25" fill="none" stroke={color} strokeWidth="1.5" opacity={opacity * 2} />
                            <path d="M60,35 Q75,50 60,65 Q45,50 60,35" fill={color} opacity={opacity} />
                            <path d="M35,60 Q50,45 65,60 Q50,75 35,60" fill={color} opacity={opacity} />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#floral)" />
                </svg>
            </div>
        );
    }

    // Organic patterns for Home & Garden
    if (type === 'organic') {
        return (
            <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
                <svg className="w-full h-full" viewBox="0 0 400 400" preserveAspectRatio="none">
                    <defs>
                        <pattern id="organic" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                            <path d="M0,50 Q25,25 50,50 T100,50" fill="none" stroke={color} strokeWidth="2" opacity={strokeOpacity} />
                            <path d="M50,0 Q25,25 50,50 T50,100" fill="none" stroke={color} strokeWidth="2" opacity={strokeOpacity} />
                            <circle cx="50" cy="50" r="8" fill={color} opacity={opacity * 2} />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#organic)" />
                </svg>
            </div>
        );
    }

    // Tech patterns for Mobile/Wearables
    if (type === 'tech') {
        return (
            <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
                <svg className="w-full h-full" viewBox="0 0 400 400" preserveAspectRatio="none">
                    <defs>
                        <pattern id="tech" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                            <rect x="0" y="0" width="60" height="60" fill="none" stroke={color} strokeWidth="1" opacity={strokeOpacity} />
                            <circle cx="30" cy="30" r="8" fill={color} opacity={opacity * 2} />
                            <line x1="0" y1="30" x2="60" y2="30" stroke={color} strokeWidth="1" opacity={strokeOpacity} />
                            <line x1="30" y1="0" x2="30" y2="60" stroke={color} strokeWidth="1" opacity={strokeOpacity} />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#tech)" />
                </svg>
            </div>
        );
    }

    // Cultural patterns for Traditional/Handicraft
    if (type === 'cultural') {
        return (
            <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
                <svg className="w-full h-full" viewBox="0 0 400 400" preserveAspectRatio="none">
                    <defs>
                        <pattern id="cultural" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                            <path d="M0,0 L100,100 M100,0 L0,100" stroke={color} strokeWidth="1.5" opacity={strokeOpacity} />
                            <circle cx="50" cy="50" r="20" fill="none" stroke={color} strokeWidth="1.5" opacity={opacity * 2} />
                            <polygon points="50,20 70,50 50,80 30,50" fill={color} opacity={opacity} />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#cultural)" />
                </svg>
            </div>
        );
    }

    // Food patterns for Food & Drink
    if (type === 'food') {
        return (
            <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
                <svg className="w-full h-full" viewBox="0 0 400 400" preserveAspectRatio="none">
                    <defs>
                        <pattern id="food" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
                            <circle cx="40" cy="40" r="20" fill="none" stroke={color} strokeWidth="2" opacity={opacity * 2} />
                            <path d="M40,20 Q50,30 40,40 Q30,30 40,20" fill={color} opacity={opacity} />
                            <path d="M20,40 Q30,50 40,40 Q30,30 20,40" fill={color} opacity={opacity} />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#food)" />
                </svg>
            </div>
        );
    }

    // Playful patterns for Toys/Kids
    if (type === 'playful') {
        return (
            <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
                <svg className="w-full h-full" viewBox="0 0 400 400" preserveAspectRatio="none">
                    <defs>
                        <pattern id="playful" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                            <circle cx="25" cy="25" r="8" fill={color} opacity={opacity * 2} />
                            <circle cx="75" cy="25" r="8" fill={color} opacity={opacity * 2} />
                            <circle cx="25" cy="75" r="8" fill={color} opacity={opacity * 2} />
                            <circle cx="75" cy="75" r="8" fill={color} opacity={opacity * 2} />
                            <path d="M25,25 Q50,50 75,25" fill="none" stroke={color} strokeWidth="2" opacity={strokeOpacity} />
                            <path d="M25,75 Q50,50 75,75" fill="none" stroke={color} strokeWidth="2" opacity={strokeOpacity} />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#playful)" />
                </svg>
            </div>
        );
    }

    // Wellness patterns for Health & Wellness
    if (type === 'wellness') {
        return (
            <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
                <svg className="w-full h-full" viewBox="0 0 400 400" preserveAspectRatio="none">
                    <defs>
                        <pattern id="wellness" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                            <circle cx="50" cy="50" r="30" fill="none" stroke={color} strokeWidth="2" opacity={opacity * 2} />
                            <circle cx="50" cy="50" r="15" fill={color} opacity={opacity} />
                            <path d="M50,20 L50,35 M50,65 L50,80 M20,50 L35,50 M65,50 L80,50" 
                                  stroke={color} strokeWidth="2" opacity={strokeOpacity} />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#wellness)" />
                </svg>
            </div>
        );
    }

    // Professional patterns for Computers
    if (type === 'professional') {
        return (
            <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
                <svg className="w-full h-full" viewBox="0 0 400 400" preserveAspectRatio="none">
                    <defs>
                        <pattern id="professional" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
                            <rect x="0" y="0" width="80" height="80" fill="none" stroke={color} strokeWidth="1" opacity={strokeOpacity} />
                            <line x1="0" y1="40" x2="80" y2="40" stroke={color} strokeWidth="1" opacity={strokeOpacity} />
                            <line x1="40" y1="0" x2="40" y2="80" stroke={color} strokeWidth="1" opacity={strokeOpacity} />
                            <circle cx="40" cy="40" r="5" fill={color} opacity={opacity * 2} />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#professional)" />
                </svg>
            </div>
        );
    }

    return null;
};

export default GeometricDecorations;

