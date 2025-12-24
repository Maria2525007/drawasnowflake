import { Box, Typography, Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { HEADER_CONFIG } from '../../config/constants';
import { t } from '../../i18n';

export const Header: React.FC = () => {
  return (
    <Box
      sx={{
        background: `
          radial-gradient(circle at top, rgba(15,27,46,0.8) 0%, transparent 70%),
          linear-gradient(135deg, ${HEADER_CONFIG.GRADIENT_START} 0%, ${HEADER_CONFIG.GRADIENT_MID} 50%, ${HEADER_CONFIG.GRADIENT_END} 100%)
        `,
        padding: { xs: 3, sm: 4, md: 5 },
        textAlign: 'center',
        color: 'white',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        position: 'relative',
      }}
    >
      <Link
        component={RouterLink}
        to="/api-info"
        sx={{
          position: 'absolute',
          bottom: { xs: 8, sm: 12, md: 16 },
          right: { xs: 16, sm: 20, md: 24 },
          color: 'white',
          textDecoration: 'none',
          fontSize: { xs: '0.75rem', sm: '0.875rem', md: '0.875rem' },
          opacity: 0.8,
          padding: { xs: '4px 8px', sm: '6px 10px', md: '8px 12px' },
          margin: 0,
          display: 'inline-block',
          '&:hover': {
            opacity: 1,
            textDecoration: 'underline',
          },
        }}
      >
        API Info
      </Link>
      <Typography
        variant="h2"
        component="h1"
        sx={{
          fontSize: { xs: '2rem', sm: '3rem', md: '4rem' },
          fontWeight: 'bold',
          marginBottom: 2,
          background: `linear-gradient(45deg, ${HEADER_CONFIG.TEXT_GRADIENT_START} 30%, ${HEADER_CONFIG.TEXT_GRADIENT_MID} 60%, ${HEADER_CONFIG.TEXT_GRADIENT_END} 90%)`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          textShadow:
            '0 0 15px rgba(129, 212, 250, 0.7), 0 0 25px rgba(255, 255, 255, 0.5)',
          letterSpacing: '0.08em',
        }}
      >
        {t('header.title')}
      </Typography>
      <Typography
        variant="body1"
        sx={{
          fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
          maxWidth: '800px',
          margin: '0 auto',
          lineHeight: 1.6,
          opacity: 0.95,
          color: HEADER_CONFIG.TEXT_COLOR,
        }}
      >
        {t('header.description')}
      </Typography>
    </Box>
  );
};
