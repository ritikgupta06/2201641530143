import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Chip,
  Tooltip,
  Snackbar,
  Alert,
  Fade,
} from '@mui/material';
import {
  ContentCopy,
  OpenInNew,
  Schedule,
  TrendingUp,
} from '@mui/icons-material';
import { ShortenUrlResponse } from '../hooks/useApi';
import { useLogger } from '../hooks/useLogger';

interface URLCardProps {
  urlData: ShortenUrlResponse;
  onViewStatistics: (shortCode: string) => void;
}

export const URLCard: React.FC<URLCardProps> = ({ urlData, onViewStatistics }) => {
  const [copySuccess, setCopySuccess] = useState(false);
  const logger = useLogger();

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(urlData.shortUrl);
      setCopySuccess(true);
      logger.info('Short URL copied to clipboard', { shortCode: urlData.shortCode });
    } catch (error) {
      logger.error('Failed to copy to clipboard', error);
    }
  };

  const handleOpenUrl = () => {
    window.open(urlData.shortUrl, '_blank');
    logger.info('Short URL opened in new tab', { shortCode: urlData.shortCode });
  };

  const isExpired = urlData.expiresAt && new Date(urlData.expiresAt) < new Date();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <Fade in timeout={300}>
      <Card
        sx={{
          mb: 2,
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: (theme) =>
              theme.palette.mode === 'dark'
                ? '0 8px 24px rgba(0,0,0,0.4)'
                : '0 8px 24px rgba(0,0,0,0.15)',
          },
        }}
      >
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
            <Box flex={1} mr={2}>
              <Typography
                variant="h6"
                component="h3"
                gutterBottom
                sx={{
                  wordBreak: 'break-all',
                  fontSize: '1.1rem',
                  fontWeight: 600,
                }}
              >
                {urlData.shortUrl}
              </Typography>
              
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  wordBreak: 'break-all',
                  mb: 1,
                }}
              >
                Original: {urlData.originalUrl}
              </Typography>
              
              <Box display="flex" gap={1} alignItems="center" flexWrap="wrap">
                <Chip
                  icon={<Schedule />}
                  label={`Created: ${formatDate(urlData.createdAt)}`}
                  size="small"
                  variant="outlined"
                />
                
                {urlData.expiresAt && (
                  <Chip
                    icon={<Schedule />}
                    label={`Expires: ${formatDate(urlData.expiresAt)}`}
                    size="small"
                    color={isExpired ? 'error' : 'warning'}
                    variant={isExpired ? 'filled' : 'outlined'}
                  />
                )}
                
                {isExpired && (
                  <Chip
                    label="EXPIRED"
                    size="small"
                    color="error"
                    variant="filled"
                  />
                )}
              </Box>
            </Box>
            
            <Box display="flex" gap={1}>
              <Tooltip title="Copy short URL">
                <IconButton
                  onClick={handleCopyToClipboard}
                  color="primary"
                  aria-label="Copy short URL to clipboard"
                >
                  <ContentCopy />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Open in new tab">
                <IconButton
                  onClick={handleOpenUrl}
                  color="primary"
                  disabled={isExpired}
                  aria-label="Open short URL in new tab"
                >
                  <OpenInNew />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="View statistics">
                <IconButton
                  onClick={() => onViewStatistics(urlData.shortCode)}
                  color="secondary"
                  aria-label="View URL statistics"
                >
                  <TrendingUp />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </CardContent>
        
        <Snackbar
          open={copySuccess}
          autoHideDuration={2000}
          onClose={() => setCopySuccess(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            onClose={() => setCopySuccess(false)}
            severity="success"
            variant="filled"
          >
            Short URL copied to clipboard!
          </Alert>
        </Snackbar>
      </Card>
    </Fade>
  );
};