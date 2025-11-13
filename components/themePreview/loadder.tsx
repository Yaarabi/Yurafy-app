import { useTheme } from '@mui/material/styles';
import { Box } from '@mui/material';
import { motion } from 'framer-motion';

const LogoLoader = () => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

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
            <div style={{ position: 'relative', width: '120px', height: '120px' }}>
                {/* Outer rotating ring */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                        duration: 1.5,
                        ease: 'linear',
                        repeat: Infinity,
                    }}
                    style={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        border: '3px solid transparent',
                        borderTopColor: 'var(--brand-blue)',
                        borderRightColor: 'var(--brand-blue)',
                        borderRadius: '50%',
                        opacity: 0.8,
                    }}
                />
                
                {/* Middle rotating ring */}
                <motion.div
                    animate={{ rotate: -360 }}
                    transition={{
                        duration: 2,
                        ease: 'linear',
                        repeat: Infinity,
                    }}
                    style={{
                        position: 'absolute',
                        width: '80%',
                        height: '80%',
                        top: '10%',
                        left: '10%',
                        border: '3px solid transparent',
                        borderBottomColor: 'var(--brand-blue)',
                        borderLeftColor: 'var(--brand-blue)',
                        borderRadius: '50%',
                        opacity: 0.6,
                    }}
                />
                
                {/* Inner pulsing circle */}
                <motion.div
                    animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 1, 0.5]
                    }}
                    transition={{
                        duration: 1.5,
                        ease: 'easeInOut',
                        repeat: Infinity,
                    }}
                    style={{
                        position: 'absolute',
                        width: '40%',
                        height: '40%',
                        top: '30%',
                        left: '30%',
                        backgroundColor: 'var(--brand-blue)',
                        borderRadius: '50%',
                        boxShadow: '0 0 20px rgba(0, 102, 255, 0.5)',
                    }}
                />
            </div>
        </Box>
    );
};

export default LogoLoader;
