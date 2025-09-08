import React, { useState, useCallback } from 'react';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Card,
  CardContent,
  Alert,
  Snackbar,
  LinearProgress,
  Chip,
  FormControlLabel,
  Switch,
  Grid,
  Fade,
  Skeleton,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Link as LinkIcon,
} from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { URLCard } from './URLCard';
import { useApi, ShortenUrlRequest, ShortenUrlResponse } from '../hooks/useApi';
import { useLogger } from '../hooks/useLogger';

interface URLInput {
  id: string;
  url: string;
  customCode: string;
  expiresAt: Date | null;
  hasExpiry: boolean;
}

interface URLShortenerProps {
  onViewStatistics: (shortCode: string) => void;
}

export const URLShortener: React.FC<URLShortenerProps> = ({ onViewStatistics }) => {
  const [urlInputs, setUrlInputs] = useState<URLInput[]>([
    { id: '1', url: '', customCode: '', expiresAt: null, hasExpiry: false },
  ]);
  const [shortenedUrls, setShortenedUrls] = useState<ShortenUrlResponse[]>([]);
  const [processingStates, setProcessingStates] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState('');
  
  const { shortenUrl, loading } = useApi();
  const logger = useLogger();

  const validateUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const validateCustomCode = (code: string): boolean => {
    if (!code) return true; // Optional
    return /^[a-zA-Z0-9_-]{3,20}$/.test(code);
  };

  const addUrlInput = () => {
    if (urlInputs.length >= 5) {
      setSuccessMessage('Maximum 5 URLs can be shortened concurrently');
      return;
    }
    
    const newInput: URLInput = {
      id: Date.now().toString(),
      url: '',
      customCode: '',
      expiresAt: null,
      hasExpiry: false,
    };
    
    setUrlInputs([...urlInputs, newInput]);
    logger.info('Added new URL input field', { totalInputs: urlInputs.length + 1 });
  };

  const removeUrlInput = (id: string) => {
    if (urlInputs.length === 1) return;
    
    setUrlInputs(urlInputs.filter(input => input.id !== id));
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[id];
      return newErrors;
    });
    logger.info('Removed URL input field', { removedId: id });
  };

  const updateUrlInput = (id: string, field: keyof URLInput, value: any) => {
    setUrlInputs(prev =>
      prev.map(input =>
        input.id === id ? { ...input, [field]: value } : input
      )
    );
    
    // Clear error when user starts typing
    if (errors[id]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[id];
        return newErrors;
      });
    }
  };

  const validateInput = (input: URLInput): string | null => {
    if (!input.url.trim()) {
      return 'URL is required';
    }
    
    if (!validateUrl(input.url)) {
      return 'Please enter a valid URL (include http:// or https://)';
    }
    
    if (input.customCode && !validateCustomCode(input.customCode)) {
      return 'Custom code must be 3-20 characters (letters, numbers, _, -)';
    }
    
    if (input.hasExpiry && input.expiresAt && input.expiresAt <= new Date()) {
      return 'Expiry date must be in the future';
    }
    
    return null;
  };

  const handleShortenUrl = async (input: URLInput) => {
    const validationError = validateInput(input);
    if (validationError) {
      setErrors(prev => ({ ...prev, [input.id]: validationError }));
      return;
    }

    setProcessingStates(prev => ({ ...prev, [input.id]: true }));
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[input.id];
      return newErrors;
    });

    try {
      const requestData: ShortenUrlRequest = {
        url: input.url,
        customCode: input.customCode || undefined,
        expiresAt: input.hasExpiry && input.expiresAt ? input.expiresAt.toISOString() : undefined,
      };

      logger.info('Shortening URL', { url: input.url, hasCustomCode: !!input.customCode });
      const result = await shortenUrl(requestData);
      
      setShortenedUrls(prev => [result, ...prev]);
      setSuccessMessage('URL shortened successfully!');
      
      // Reset the input
      updateUrlInput(input.id, 'url', '');
      updateUrlInput(input.id, 'customCode', '');
      updateUrlInput(input.id, 'expiresAt', null);
      updateUrlInput(input.id, 'hasExpiry', false);
      
      logger.info('URL shortened successfully', { 
        shortCode: result.shortCode,
        originalUrl: result.originalUrl 
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to shorten URL';
      setErrors(prev => ({ ...prev, [input.id]: errorMessage }));
      logger.error('Failed to shorten URL', { url: input.url, error: errorMessage });
    } finally {
      setProcessingStates(prev => ({ ...prev, [input.id]: false }));
    }
  };

  const handleShortenAll = async () => {
    const validInputs = urlInputs.filter(input => input.url.trim());
    
    if (validInputs.length === 0) {
      setSuccessMessage('Please enter at least one URL');
      return;
    }

    logger.info('Starting batch URL shortening', { count: validInputs.length });
    
    // Process all valid inputs concurrently
    const promises = validInputs.map(input => handleShortenUrl(input));
    await Promise.allSettled(promises);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Fade in timeout={500}>
          <Box textAlign="center" mb={4}>
            <Typography
              variant="h2"
              component="h1"
              gutterBottom
              sx={{
                background: 'linear-gradient(45deg, #1976d2, #9c27b0)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 700,
                mb: 2,
              }}
            >
              Shorten Your URLs
            </Typography>
            
            <Typography
              variant="h5"
              color="text.secondary"
              sx={{ mb: 4, maxWidth: '600px', mx: 'auto' }}
            >
              Create short, memorable links that are easy to share. 
              Support for custom codes, expiry dates, and detailed analytics.
            </Typography>
            
            <Box display="flex" justifyContent="center" gap={2} mb={4}>
              <Chip
                icon={<LinkIcon />}
                label={`${urlInputs.length}/5 URLs`}
                color={urlInputs.length >= 5 ? 'error' : 'primary'}
                variant="outlined"
              />
            </Box>
          </Box>
        </Fade>

        <Grid container spacing={4}>
          <Grid item xs={12} lg={6}>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  URL Shortening
                </Typography>
                
                {loading && <LinearProgress sx={{ mb: 2 }} />}
                
                <Box sx={{ space: 2 }}>
                  {urlInputs.map((input, index) => (
                    <Fade in key={input.id} timeout={300}>
                      <Box
                        sx={{
                          p: 2,
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 2,
                          mb: 2,
                          backgroundColor: 'background.paper',
                        }}
                      >
                        <Box display="flex" alignItems="center" justifyContent="between" mb={2}>
                          <Typography variant="subtitle2" color="text.secondary">
                            URL #{index + 1}
                          </Typography>
                          
                          {urlInputs.length > 1 && (
                            <Button
                              size="small"
                              color="error"
                              onClick={() => removeUrlInput(input.id)}
                              startIcon={<DeleteIcon />}
                              sx={{ ml: 'auto' }}
                            >
                              Remove
                            </Button>
                          )}
                        </Box>
                        
                        <TextField
                          fullWidth
                          label="Enter URL to shorten"
                          placeholder="https://example.com/very-long-url"
                          value={input.url}
                          onChange={(e) => updateUrlInput(input.id, 'url', e.target.value)}
                          error={!!errors[input.id]}
                          helperText={errors[input.id]}
                          sx={{ mb: 2 }}
                          InputProps={{
                            'aria-label': `URL input ${index + 1}`,
                          }}
                        />
                        
                        <TextField
                          fullWidth
                          label="Custom short code (optional)"
                          placeholder="my-link"
                          value={input.customCode}
                          onChange={(e) => updateUrlInput(input.id, 'customCode', e.target.value)}
                          sx={{ mb: 2 }}
                          helperText="3-20 characters: letters, numbers, underscore, hyphen"
                          InputProps={{
                            'aria-label': `Custom code input ${index + 1}`,
                          }}
                        />
                        
                        <FormControlLabel
                          control={
                            <Switch
                              checked={input.hasExpiry}
                              onChange={(e) => updateUrlInput(input.id, 'hasExpiry', e.target.checked)}
                            />
                          }
                          label="Set expiry date"
                          sx={{ mb: input.hasExpiry ? 2 : 0 }}
                        />
                        
                        {input.hasExpiry && (
                          <DateTimePicker
                            label="Expiry Date & Time"
                            value={input.expiresAt}
                            onChange={(newValue) => updateUrlInput(input.id, 'expiresAt', newValue)}
                            minDate={new Date()}
                            sx={{ width: '100%', mb: 2 }}
                            slotProps={{
                              textField: {
                                'aria-label': `Expiry date picker ${index + 1}`,
                              },
                            }}
                          />
                        )}
                        
                        <Button
                          variant="contained"
                          onClick={() => handleShortenUrl(input)}
                          disabled={processingStates[input.id] || !input.url.trim()}
                          sx={{ mr: 1 }}
                          fullWidth
                        >
                          {processingStates[input.id] ? 'Shortening...' : 'Shorten URL'}
                        </Button>
                      </Box>
                    </Fade>
                  ))}
                  
                  <Box display="flex" gap={2}>
                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={addUrlInput}
                      disabled={urlInputs.length >= 5}
                      sx={{ flex: 1 }}
                    >
                      Add URL ({urlInputs.length}/5)
                    </Button>
                    
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={handleShortenAll}
                      disabled={loading || urlInputs.every(input => !input.url.trim())}
                      sx={{ flex: 1 }}
                    >
                      Shorten All
                    </Button>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} lg={6}>
            <Typography variant="h6" gutterBottom>
              Shortened URLs ({shortenedUrls.length})
            </Typography>
            
            {shortenedUrls.length === 0 ? (
              <Card>
                <CardContent sx={{ textAlign: 'center', py: 6 }}>
                  <LinkIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No URLs shortened yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Enter a URL and click "Shorten URL" to get started
                  </Typography>
                </CardContent>
              </Card>
            ) : (
              <Box>
                {shortenedUrls.map((urlData) => (
                  <URLCard
                    key={urlData.id}
                    urlData={urlData}
                    onViewStatistics={onViewStatistics}
                  />
                ))}
              </Box>
            )}
          </Grid>
        </Grid>
        
        <Snackbar
          open={!!successMessage}
          autoHideDuration={4000}
          onClose={() => setSuccessMessage('')}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            onClose={() => setSuccessMessage('')}
            severity="success"
            variant="filled"
          >
            {successMessage}
          </Alert>
        </Snackbar>
      </Container>
    </LocalizationProvider>
  );
};