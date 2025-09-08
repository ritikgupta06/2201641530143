import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import HomePage from './pages/HomePage';
import StatsPage from './pages/StatsPage';
import RedirectPage from './components/RedirectPage';
import { AuthContext } from './contexts/AuthContext';
import { logEvent } from './utils/loggingMiddleware';
import { getAuthToken } from './utils/api';

function App() {
  const [authToken, setAuthToken] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        const token = await getAuthToken();
        setAuthToken(token);
        await logEvent('info', 'App initialized successfully with auth token', { timestamp: new Date().toISOString() });
      } catch (error) {
        await logEvent('error', 'Failed to initialize app', { error: (error as Error).message });
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="bg-card border border-border rounded-lg p-8 shadow-dark">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent"></div>
            <span className="text-foreground font-medium">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-dark">
      <AuthContext.Provider value={{ authToken, setAuthToken }}>
        <Router>
          <div className="flex flex-col min-h-screen">
            <Routes>
              <Route path="/" element={
                <>
                  <Navigation />
                  <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
                    <HomePage />
                  </main>
                </>
              } />
              <Route path="/stats" element={
                <>
                  <Navigation />
                  <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
                    <StatsPage />
                  </main>
                </>
              } />
              <Route path="/:shortcode" element={<RedirectPage />} />
            </Routes>
          </div>
        </Router>
      </AuthContext.Provider>
    </div>
  );
}

export default App;