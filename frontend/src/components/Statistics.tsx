import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Alert,
  CircularProgress,
  Link
} from '@mui/material';
import { Refresh, ExpandMore, Launch } from '@mui/icons-material';
import { getStats } from '../utils/api';
import { logEvent } from '../utils/loggingMiddleware';

interface UrlStat {
  shortcode: string;
  longUrl: string;
  shortUrl: string;
  createdAt: string;
  expiresAt: string;
  totalClicks: number;
  clickDetails: {
    timestamp: string;
    source: string;
    location: string;
  }[];
}

const Statistics: React.FC = () => {
  const [stats, setStats] = useState<UrlStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const fetchStats = async () => {
    setLoading(true);
    setError('');
    try {
      await logEvent('info', 'Fetching statistics data');
      const data = await getStats();
      setStats(data);
      await logEvent('success', 'Statistics data fetched successfully', { count: data.length });
    } catch (err) {
      const errorMessage = 'Failed to fetch statistics';
      setError(errorMessage);
      await logEvent('error', errorMessage, { error: (err as Error).message });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    await logEvent('info', 'Statistics refresh initiated by user');
    await fetchStats();
  };

  const handleShortUrlClick = async (shortUrl: string, shortcode: string) => {
    await logEvent('info', 'Short URL clicked from statistics', { shortcode, shortUrl });
    window.open(shortUrl, '_blank');
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
        <Button onClick={handleRefresh} sx={{ ml: 2 }}>
          Try Again
        </Button>
      </Alert>
    );
  }

  if (stats.length === 0) {
    return (
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          No shortened URLs found
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Create some short URLs first to see statistics here
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={handleRefresh}
          sx={{ mt: 2 }}
        >
          Refresh
        </Button>
      </Paper>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">
          URL Statistics ({stats.length} URLs)
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={handleRefresh}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      <TableContainer component={Paper} elevation={3}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell><Typography variant="subtitle2" fontWeight="bold">Short URL</Typography></TableCell>
              <TableCell><Typography variant="subtitle2" fontWeight="bold">Original URL</Typography></TableCell>
              <TableCell><Typography variant="subtitle2" fontWeight="bold">Created</Typography></TableCell>
              <TableCell><Typography variant="subtitle2" fontWeight="bold">Expires</Typography></TableCell>
              <TableCell><Typography variant="subtitle2" fontWeight="bold">Clicks</Typography></TableCell>
              <TableCell><Typography variant="subtitle2" fontWeight="bold">Actions</Typography></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {stats.map((stat) => (
              <TableRow key={stat.shortcode} hover>
                <TableCell>
                  <Link
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handleShortUrlClick(stat.shortUrl, stat.shortcode);
                    }}
                    sx={{ 
                      color: 'primary.main', 
                      textDecoration: 'none',
                      fontWeight: 'bold',
                      '&:hover': {
                        textDecoration: 'underline'
                      }
                    }}
                  >
                    {stat.shortUrl}
                  </Link>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" noWrap title={stat.longUrl}>
                    {stat.longUrl.length > 40 
                      ? `${stat.longUrl.substring(0, 40)}...` 
                      : stat.longUrl}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {new Date(stat.createdAt).toLocaleDateString()}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(stat.createdAt).toLocaleTimeString()}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {new Date(stat.expiresAt).toLocaleDateString()}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(stat.expiresAt).toLocaleTimeString()}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={stat.totalClicks} 
                    color={stat.totalClicks > 0 ? "success" : "default"}
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <IconButton 
                    size="small" 
                    onClick={() => handleShortUrlClick(stat.shortUrl, stat.shortcode)}
                    title="Open short URL"
                  >
                    <Launch fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Detailed Click Information */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Detailed Click Information
        </Typography>
        {stats.filter(stat => stat.clickDetails.length > 0).length === 0 ? (
          <Paper elevation={1} sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary">
              No click data available yet
            </Typography>
          </Paper>
        ) : (
          stats
            .filter(stat => stat.clickDetails.length > 0)
            .map((stat) => (
              <Accordion key={stat.shortcode} sx={{ mb: 1 }}>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                      {stat.shortcode}
                    </Typography>
                    <Chip 
                      label={`${stat.totalClicks} clicks`} 
                      size="small" 
                      color="primary" 
                      variant="outlined"
                    />
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto' }}>
                      {stat.longUrl.length > 60 
                        ? `${stat.longUrl.substring(0, 60)}...` 
                        : stat.longUrl}
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell><Typography variant="caption" fontWeight="bold">Timestamp</Typography></TableCell>
                          <TableCell><Typography variant="caption" fontWeight="bold">Source</Typography></TableCell>
                          <TableCell><Typography variant="caption" fontWeight="bold">Location</Typography></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {stat.clickDetails.map((click, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <Typography variant="body2">
                                {new Date(click.timestamp).toLocaleString()}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={click.source} 
                                size="small" 
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {click.location}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </AccordionDetails>
              </Accordion>
            ))
        )}
      </Box>
    </Box>
  );
};

export default Statistics;