
'use client';

export default function ThemeInjector({ theme }: { theme?: Record<string, string> }) {
    return (
        <style jsx global>{`
            :root {
                --primary-color: ${theme?.primaryColor || '#22c55e'};
                --secondary-color: ${theme?.secondaryColor || '#f3f4f6'};
                --background-color: ${theme?.backgroundColor || '#ffffff'};
                --text-color: ${theme?.textColor || '#111827'};
                --button-color: ${theme?.buttonColor || '#22c55e'};
                --header-color: ${theme?.headerColor || '#ffffff'};
            }
        `}</style>
    );
}
