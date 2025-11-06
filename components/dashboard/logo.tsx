
import React from "react";

interface LogoProps {
    size?: number;
}

const Logo: React.FC<LogoProps> = ({ size = 28 }) => (

    <div className="flex items-center gap-2">
        <svg
        width={size}
        height={size}
        viewBox="0 0 120 120"
        xmlns="http://www.w3.org/2000/svg"
        >
        <defs>
            <radialGradient id="yuraGrad" cx="50%" cy="40%" r="70%">
            <stop offset="0%" stopColor="#9C5CFD" />
            <stop offset="50%" stopColor="#6B42F5" />
            <stop offset="100%" stopColor="#2CC3F9" />
            </radialGradient>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
            </feMerge>
            </filter>
        </defs>
        <path
            d="M60,20 C35,35 30,60 45,80 C60,100 85,95 95,75 C105,55 90,30 60,20 Z"
            fill="url(#yuraGrad)"
            filter="url(#glow)"
        />
        <path
            d="M35,85 C50,95 75,95 95,80"
            stroke="#2CF3E9"
            strokeWidth="6"
            strokeLinecap="round"
            fill="none"
            opacity="0.9"
        />
        </svg>
        <span className="font-semibold tracking-wide text-gray-800 dark:text-gray-100 hover:text-[var(--brand-blue)] transition-colors">Yurafy</span>
    </div>
);

export default Logo;
