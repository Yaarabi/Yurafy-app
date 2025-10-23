"use client";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import { sanitizeTheme, Theme as StoreTheme } from "@/models/store";

export default function StoreThemeProvider({
    theme,
    children,
    }: {
    theme: StoreTheme;
    children: React.ReactNode;
    }) {
    const sanitized = sanitizeTheme(theme);

    // Build a valid 25-element shadows array
    const customShadows: string[] = Array(25).fill("none");
    if (sanitized.shadow) {
        // Example: override the "z1" shadow (index 1)
        customShadows[1] = "0px 4px 20px rgba(0,0,0,0.1)";
    }

    const muiTheme = createTheme({
        palette: {
        primary: { main: sanitized.primaryColor || "#4CAF50" },
        secondary: { main: sanitized.secondaryColor || "#FFC107" },
        background: { default: sanitized.backgroundColor || "#fff" },
        text: { primary: sanitized.textColor || "#111" },
        },
        typography: {
        fontFamily: sanitized.fontFamily || "Inter, sans-serif",
        fontWeightBold: sanitized.headingWeight
            ? parseInt(sanitized.headingWeight)
            : 600,
        },
        shape: {
        borderRadius: sanitized.borderRadius
            ? parseInt(sanitized.borderRadius)
            : 8,
        },
        shadows: customShadows as any, // TS-safe, matches MUI's expected 25-length array
    });

    return (
        <ThemeProvider theme={muiTheme}>
        <CssBaseline />
        {children}
        </ThemeProvider>
    );
}
