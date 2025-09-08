import React, { useState, useEffect } from 'react';
import { Box, CssBaseline } from '@mui/material';
import { Navigation } from './components/Navigation';
import { URLShortener } from './components/URLShortener';
import { Statistics } from './components/Statistics';
import { ProtectedRoute } from './components/ProtectedRoute';
import { CustomThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { useLogger } from './hooks/useLogger';

type Page = 'shortener' | 'statistics';

function AppContent() {
  const [currentPage, setCurrentPage] = useState<Page>('shortener');
  const [selectedShortCode, setSelectedShortCode] = useState<string>('');
  const logger = useLogger();

  useEffect(() => {
    logger.info('URL Shortener App initialized');
  }, [logger]);

  const handlePageChange = (page: Page) => {
    setCurrentPage(page);
    logger.info('Page changed', { page });
  };

  const handleViewStatistics = (shortCode: string) => {
    setSelectedShortCode(shortCode);
    setCurrentPage('statistics');
    logger.info('Viewing statistics for short code', { shortCode });
  };

  // Set the selected short code when switching to statistics page
  useEffect(() => {
    if (currentPage === 'statistics' && selectedShortCode) {
      // This effect will trigger the statistics component to load data
      // when we navigate to it with a selected short code
    }
  }, [currentPage, selectedShortCode]);

  return (
    <ProtectedRoute>
      <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
        <CssBaseline />
        
        <Navigation
          currentPage={currentPage}
          onPageChange={handlePageChange}
        />
        
        <main role="main">
          {currentPage === 'shortener' ? (
            <URLShortener onViewStatistics={handleViewStatistics} />
          ) : (
            <Statistics key={selectedShortCode} />
          )}
        </main>
      </Box>
    </ProtectedRoute>
  );
}

function App() {
  return (
    <AuthProvider>
      <CustomThemeProvider>
        <AppContent />
      </CustomThemeProvider>
    </AuthProvider>
  );
}

export default App;