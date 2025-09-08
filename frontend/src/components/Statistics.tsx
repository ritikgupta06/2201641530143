import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Skeleton,
  Grid,
  LinearProgress,
  Divider,
  IconButton,
  Tooltip,
  Fade,
} from '@mui/material';
import {
  Search as SearchIcon,
  TrendingUp,
  Schedule,
  Link as LinkIcon,
  Refresh as RefreshIcon,
  OpenInNew,
} from '@mui/icons-material';
import { useApi, UrlStatistics } from '../hooks/useApi';
import { useLogger } from '../hooks/useLogger';

export const Statistics: React.FC = () => {
  const [shortCode, setShortCode] = useState('');
  const [statistics, setStatistics] = useState<UrlStatistics | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const { getUrlStatistics } = useApi();
  const logger = useLogger();

  const handleSearch = async () => {
    if (!shortCode.trim()) {
      setError('Please enter a short code');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      logger.info('Fetching URL statistics', { shortCode });
      const data = await getUrlStatistics(shortCode.trim());
      setStatistics(data);
      logger.info('Successfully fetched URL statistics', { 
        shortCode, 
        clickCount: data.clicks.length 
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch statistics';
      setError(errorMessage);
      logger.error('Failed to fetch URL statistics', { shortCode, error: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getTotalClicks = () => statistics?.clicks.length || 0;

  const getUniqueReferrers = () => {
    if (!statistics?.clicks) return 0;
    const referrers = new Set(
      statistics.clicks
        .map(click => click.referrer)
        .filter(referrer => referrer && referrer !== 'Direct')
    );
    return referrers.size;
  };

  const getClicksToday = () => {
    if (!statistics?.clicks) return 0;
    const today = new Date().toDateString();
    return statistics.clicks.filter(
      click => new Date(click.timestamp).toDateString() === today
    ).length;
  };

  const isExpired = statistics?.expiresAt && new Date(statistics.expiresAt) < new Date();

  return (
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
            URL Statistics
          </Typography>
          
          <Typography
            variant="h5"
            color="text.secondary"
            sx={{ mb: 4, maxWidth: '600px', mx: 'auto' }}
          >
            View detailed analytics for your shortened URLs including click data, 
            referrers, and geographical information.
          </Typography>
        </Box>
      </Fade>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Search URL Statistics
          </Typography>
          
          <Box display="flex" gap={2} alignItems="flex-start">
            <TextField
              fullWidth
              label="Enter short code"
              placeholder="e.g., abc123"
              value={shortCode}
              onChange={(e) => setShortCode(e.target.value)}
              onKeyPress={handleKeyPress}
              error={!!error}
              helperText={error || 'Enter the short code (the part after the last slash in your short URL)'}
              InputProps={{
                'aria-label': 'Short code input',
              }}
            />
            
            <Button
              variant="contained"
              startIcon={<SearchIcon />}
              onClick={handleSearch}
              disabled={isLoading || !shortCode.trim()}
              sx={{ minWidth: 120, height: 56 }}
            >
              {isLoading ? 'Loading...' : 'Search'}
            </Button>
          </Box>
          
          {isLoading && <LinearProgress sx={{ mt: 2 }} />}
        </CardContent>
      </Card>

      {statistics && (
        <Fade in timeout={300}>
          <Box>
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center" justifyContent="between" mb={2}>
                      <Typography variant="h6" component="h2">
                        URL Details
                      </Typography>
                      
                      <Box display="flex" gap={1}>
                        <Tooltip title="Refresh statistics">
                          <IconButton
                            onClick={handleSearch}
                            disabled={isLoading}
                            size="small"
                          >
                            <RefreshIcon />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Open URL">
                          <IconButton
                            onClick={() => window.open(statistics.shortUrl, '_blank')}
                            disabled={isExpired}
                            size="small"
                            color="primary"
                          >
                            <OpenInNew />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Short URL
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          wordBreak: 'break-all',
                          fontFamily: 'monospace',
                          backgroundColor: 'action.hover',
                          p: 1,
                          borderRadius: 1,
                          mb: 2,
                        }}
                      >
                        {statistics.shortUrl}
                      </Typography>
                      
                      <Typography variant="subtitle2" color="text.secondary">
                        Original URL
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          wordBreak: 'break-all',
                          fontFamily: 'monospace',
                          backgroundColor: 'action.hover',
                          p: 1,
                          borderRadius: 1,
                        }}
                      >
                        {statistics.originalUrl}
                      </Typography>
                    </Box>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Box display="flex" gap={1} flexWrap="wrap">
                      <Chip
                        icon={<Schedule />}
                        label={`Created: ${formatDate(statistics.createdAt)}`}
                        size="small"
                        variant="outlined"
                      />
                      
                      {statistics.expiresAt && (
                        <Chip
                          icon={<Schedule />}
                          label={`Expires: ${formatDate(statistics.expiresAt)}`}
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
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" component="h2" gutterBottom>
                      Quick Stats
                    </Typography>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={4}>
                        <Box textAlign="center" sx={{ p: 2 }}>
                          <TrendingUp color="primary" sx={{ fontSize: 32, mb: 1 }} />
                          <Typography variant="h4" component="div" color="primary">
                            {getTotalClicks()}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Total Clicks
                          </Typography>
                        </Box>
                      </Grid>
                      
                      <Grid item xs={4}>
                        <Box textAlign="center" sx={{ p: 2 }}>
                          <LinkIcon color="secondary" sx={{ fontSize: 32, mb: 1 }} />
                          <Typography variant="h4" component="div" color="secondary">
                            {getUniqueReferrers()}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Referrers
                          </Typography>
                        </Box>
                      </Grid>
                      
                      <Grid item xs={4}>
                        <Box textAlign="center" sx={{ p: 2 }}>
                          <Schedule color="success" sx={{ fontSize: 32, mb: 1 }} />
                          <Typography variant="h4" component="div" color="success.main">
                            {getClicksToday()}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Today
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Card>
              <CardContent>
                <Typography variant="h6" component="h2" gutterBottom>
                  Click History ({statistics.clicks.length} clicks)
                </Typography>
                
                {statistics.clicks.length === 0 ? (
                  <Box textAlign="center" py={4}>
                    <TrendingUp sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      No clicks yet
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Share your short URL to start seeing click data here
                    </Typography>
                  </Box>
                ) : (
                  <TableContainer component={Paper} variant="outlined">
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Timestamp</TableCell>
                          <TableCell>Referrer</TableCell>
                          <TableCell>Location</TableCell>
                          <TableCell>User Agent</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {statistics.clicks
                          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                          .map((click, index) => (
                            <TableRow key={index} hover>
                              <TableCell>
                                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                  {formatDate(click.timestamp)}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                {click.referrer ? (
                                  <Chip
                                    label={click.referrer}
                                    size="small"
                                    variant="outlined"
                                    sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}
                                  />
                                ) : (
                                  <Chip
                                    label="Direct"
                                    size="small"
                                    color="default"
                                    variant="filled"
                                  />
                                )}
                              </TableCell>
                              <TableCell>
                                {click.geo ? (
                                  <Chip
                                    label={click.geo}
                                    size="small"
                                    color="primary"
                                    variant="outlined"
                                  />
                                ) : (
                                  <Typography variant="body2" color="text.secondary">
                                    Unknown
                                  </Typography>
                                )}
                              </TableCell>
                              <TableCell>
                                <Typography
                                  variant="caption"
                                  sx={{
                                    fontFamily: 'monospace',
                                    maxWidth: 200,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    display: 'block',
                                  }}
                                  title={click.userAgent}
                                >
                                  {click.userAgent || 'Unknown'}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
            </Card>
          </Box>
        </Fade>
      )}
    </Container>
  );
};