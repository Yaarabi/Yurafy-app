import { useTheme } from '@mui/material/styles';
import { Box } from '@mui/material';
import { motion, useCycle } from 'framer-motion';

const LogoLoader = () => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    const glowColor = isDark ? '#6f00ff' : '#00e0ff';
    const gradient = `radial-gradient(circle at center, ${glowColor}, ${
        isDark ? '#00e0ff' : '#6f00ff'
    })`;

    return (
        <Box
        sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'transparent',
            zIndex: 9999,
        }}
        >
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: [1, 1.05, 1] }}
            transition={{
            duration: 1.2,
            ease: 'easeOut',
            repeat: Infinity,
            repeatType: 'loop',
            }}
            style={{
            width: 80,
            height: 80,
            background: gradient,
            boxShadow: `0 0 20px ${glowColor}`,
            maskImage: 'url(/yurafy.svg)',
            WebkitMaskImage: 'url(/yurafy.svg)',
            maskSize: 'contain',
            maskRepeat: 'no-repeat',
            maskPosition: 'center',
            }}
        />
        </Box>
    );
};

export default LogoLoader;
