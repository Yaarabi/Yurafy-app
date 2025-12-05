import React, { Suspense, lazy } from 'react';

type ThemeHeaderFooterProps = {
    themeId: number;
    section: 'header' | 'footer';
}

const themeComponents: Record<number, Record<string, React.LazyExoticComponent<React.FC<{}>>> > = {
    1: {
        header: lazy(() => import('./theme1/sections/Header')),
        footer: lazy(() => import('./theme1/sections/Footer')),
    },
    2: {
        header: lazy(() => import('./theme2/sections/Header')),
        footer: lazy(() => import('./theme2/sections/Footer')),
    },
    3: {
        header: lazy(() => import('./theme3/sections/Header')),
        footer: lazy(() => import('./theme3/sections/Footer')),
    },
    4: {
        header: lazy(() => import('./theme4/sections/Header')),
        footer: lazy(() => import('./theme4/sections/Footer')),
    },
    5: {
        header: lazy(() => import('./theme5/sections/Header')),
        footer: lazy(() => import('./theme5/sections/Footer')),
    },
    6: {
        header: lazy(() => import('./theme6/sections/Header')),
        footer: lazy(() => import('./theme6/sections/Footer')),
    },
    7: {
        header: lazy(() => import('./theme7/sections/Header')),
        footer: lazy(() => import('./theme7/sections/Footer')),
    },
    8: {
        header: lazy(() => import('./theme8/sections/Header')),
        footer: lazy(() => import('./theme8/sections/Footer')),
    },
    9: {
        header: lazy(() => import('./theme9/sections/Header')),
        footer: lazy(() => import('./theme9/sections/Footer')),
    },
    10: {
        header: lazy(() => import('./theme10/sections/Header')),
        footer: lazy(() => import('./theme10/sections/Footer')),
    }
};

const LoadingFallback: React.FC = () => (
    <div className="h-16 bg-gray-100 animate-pulse"></div>
);

const ThemeHeaderFooter: React.FC<ThemeHeaderFooterProps> = ({ themeId, section }) => {
    const ComponentToRender = themeComponents[themeId]?.[section] || themeComponents[1][section];

    return (
        <Suspense fallback={<LoadingFallback />}>
            <ComponentToRender />
        </Suspense>
    );
};

export default ThemeHeaderFooter;
