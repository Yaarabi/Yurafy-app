
import React, { Suspense, lazy } from 'react';

type ThemeRendererProps = {
    themeId: number;
    currentPage: 'STORE_PAGE' | 'PRODUCT_PAGE';
    disableNavigation?: boolean;
}

const themeComponents: Record<number, Record<string, React.LazyExoticComponent<React.FC<{}>>>> = {
    1: {
        StorePage: lazy(() => import('./theme1/StorePage')),
        ProductPage: lazy(() => import('./theme1/ProductPage')),
    },
    2: {
        StorePage: lazy(() => import('./theme2/StorePage')),
        ProductPage: lazy(() => import('./theme2/ProductPage')),
    },
    3: {
        StorePage: lazy(() => import('./theme3/StorePage')),
        ProductPage: lazy(() => import('./theme3/ProductPage')),
    },
    4: {
        StorePage: lazy(() => import('./theme4/StorePage')),
        ProductPage: lazy(() => import('./theme4/ProductPage')),
    },
    5: {
        StorePage: lazy(() => import('./theme5/StorePage')),
        ProductPage: lazy(() => import('./theme5/ProductPage')),
    },
    6: {
        StorePage: lazy(() => import('./theme6/StorePage')),
        ProductPage: lazy(() => import('./theme6/ProductPage')),
    },
    7: {
        StorePage: lazy(() => import('./theme7/StorePage')),
        ProductPage: lazy(() => import('./theme7/ProductPage')),
    },
    8: {
        StorePage: lazy(() => import('./theme8/StorePage')),
        ProductPage: lazy(() => import('./theme8/ProductPage')),
    },
    9: {
        StorePage: lazy(() => import('./theme9/StorePage')),
        ProductPage: lazy(() => import('./theme9/ProductPage')),
    },
    10: {
        StorePage: lazy(() => import('./theme10/StorePage')),
        ProductPage: lazy(() => import('./theme10/ProductPage')),
    }
};

const LoadingFallback: React.FC = () => (
    <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-[var(--color-primary)]"></div>
    </div>
);

const ThemeRenderer: React.FC<ThemeRendererProps> = ({ themeId, currentPage }) => {
    const pageKey = currentPage === 'STORE_PAGE' ? 'StorePage' : 'ProductPage';
    const ComponentToRender = themeComponents[themeId]?.[pageKey] || themeComponents[1][pageKey];

    return (
        <Suspense fallback={<LoadingFallback />}>
            <ComponentToRender />
        </Suspense>
    );
};

export default ThemeRenderer;
