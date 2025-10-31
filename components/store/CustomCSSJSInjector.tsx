'use client';

import { useEffect } from 'react';

interface CustomCSSJSInjectorProps {
    customCSS?: string;
    customJS?: string;
}

export default function CustomCSSJSInjector({ customCSS, customJS }: CustomCSSJSInjectorProps) {
    useEffect(() => {
        // Inject custom CSS
        if (customCSS) {
            const styleId = 'custom-store-css';
            let styleElement = document.getElementById(styleId) as HTMLStyleElement;
            
            if (!styleElement) {
                styleElement = document.createElement('style');
                styleElement.id = styleId;
                document.head.appendChild(styleElement);
            }
            
            styleElement.textContent = customCSS;
        }

        // Inject custom JS
        if (customJS) {
            const scriptId = 'custom-store-js';
            let scriptElement = document.getElementById(scriptId) as HTMLScriptElement;
            
            if (!scriptElement) {
                scriptElement = document.createElement('script');
                scriptElement.id = scriptId;
                document.body.appendChild(scriptElement);
            }
            
            // Execute the custom JavaScript
            try {
                // Use Function constructor to execute in global scope
                const executeScript = new Function(customJS);
                executeScript();
            } catch (error) {
                console.error('Error executing custom JavaScript:', error);
            }
        }

        // Cleanup function
        return () => {
            const styleElement = document.getElementById('custom-store-css');
            const scriptElement = document.getElementById('custom-store-js');
            if (styleElement) styleElement.remove();
            if (scriptElement) scriptElement.remove();
        };
    }, [customCSS, customJS]);

    return null;
}

