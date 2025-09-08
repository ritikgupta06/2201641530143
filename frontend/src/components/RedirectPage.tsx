import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Home, AlertCircle } from 'lucide-react';
import { logEvent } from '../utils/loggingMiddleware';

const RedirectPage = () => {
  const { shortcode } = useParams<{ shortcode: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const handleRedirect = async () => {
      if (!shortcode) {
        setError('Invalid short URL');
        setLoading(false);
        return;
      }

      try {
        await logEvent('info', 'Short URL accessed for redirection', { shortcode });

        const storedUrls = localStorage.getItem('shortenedUrls');
        const urlMappings = storedUrls ? JSON.parse(storedUrls) : {};

        if (urlMappings[shortcode]) {
          const urlData = urlMappings[shortcode];
          
          if (new Date() > new Date(urlData.expiresAt)) {
            await logEvent('warn', 'Attempted to access expired short URL', { 
              shortcode, 
              expiresAt: urlData.expiresAt 
            });
            setError('This short URL has expired');
            setLoading(false);
            return;
          }

          urlData.clicks = (urlData.clicks || 0) + 1;
          urlData.clickDetails = urlData.clickDetails || [];
          urlData.clickDetails.push({
            timestamp: new Date().toISOString(),
            source: document.referrer || 'Direct',
            location: 'Unknown'
          });

          urlMappings[shortcode] = urlData;
          localStorage.setItem('shortenedUrls', JSON.stringify(urlMappings));

          await logEvent('success', 'Short URL redirected successfully', { 
            shortcode, 
            longUrl: urlData.longUrl,
            totalClicks: urlData.clicks 
          });

          window.location.href = urlData.longUrl;
        } else {
          await logEvent('error', 'Short URL not found', { shortcode });
          setError('Short URL not found');
          setLoading(false);
        }
      } catch (err) {
        await logEvent('error', 'Error during redirection', { 
          shortcode, 
          error: (err as Error).message 
        });
        setError('An error occurred during redirection');
        setLoading(false);
      }
    };

    const timer = setTimeout(handleRedirect, 1000);
    return () => clearTimeout(timer);
  }, [shortcode]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center p-4">
        <div className="bg-card border border-border rounded-xl shadow-dark p-8 text-center max-w-md mx-auto">
          <div className="bg-gradient-primary p-4 rounded-full w-16 h-16 mx-auto mb-6 golden-glow">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-foreground border-t-transparent"></div>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-3">
            Redirecting...
          </h2>
          <p className="text-muted-foreground mb-4">
            Taking you to your destination
          </p>
          <div className="bg-muted rounded-lg p-3">
            <span className="text-sm text-muted-foreground">Short code: </span>
            <span className="text-primary font-semibold">{shortcode}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-dark flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl shadow-dark p-8 text-center max-w-md mx-auto">
        <div className="bg-destructive/20 p-4 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>
        
        <h2 className="text-2xl font-bold text-foreground mb-3">
          {error}
        </h2>
        
        <p className="text-muted-foreground mb-6">
          The short URL "{shortcode}" could not be found or has expired.
        </p>
        
        <button
          onClick={() => window.location.href = '/'}
          className="flex items-center space-x-2 mx-auto px-6 py-3 bg-gradient-primary text-primary-foreground rounded-lg hover:shadow-golden transition-all duration-300 font-semibold"
        >
          <Home className="h-4 w-4" />
          <span>Go to Homepage</span>
        </button>
      </div>
    </div>
  );
};

export default RedirectPage;