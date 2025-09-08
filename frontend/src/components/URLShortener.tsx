import { useState } from 'react';
import { Plus, Minus, Copy, Link, Clock, Hash } from 'lucide-react';
import { shortenUrl } from '../utils/api';
import { logEvent } from '../utils/loggingMiddleware';
import { validateUrl, validateShortcode } from '../utils/validation';

interface UrlForm {
  id: string;
  longUrl: string;
  validity: number;
  customShortcode: string;
  error?: string;
}

interface ShortenedResult {
  id: string;
  shortUrl: string;
  longUrl: string;
  expiresAt: string;
  shortcode: string;
}

const UrlShortener = () => {
  const [forms, setForms] = useState<UrlForm[]>([
    { id: '1', longUrl: '', validity: 30, customShortcode: '' }
  ]);
  const [results, setResults] = useState<ShortenedResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' as 'success' | 'error' });

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ ...notification, show: false }), 3000);
  };

  const addUrlForm = async () => {
    if (forms.length < 5) {
      const newForm: UrlForm = {
        id: Date.now().toString(),
        longUrl: '',
        validity: 30,
        customShortcode: ''
      };
      setForms([...forms, newForm]);
      await logEvent('info', 'URL form added', { formsCount: forms.length + 1 });
    }
  };

  const removeUrlForm = async (id: string) => {
    if (forms.length > 1) {
      setForms(forms.filter(form => form.id !== id));
      await logEvent('info', 'URL form removed', { formsCount: forms.length - 1 });
    }
  };

  const updateForm = (id: string, field: keyof UrlForm, value: string | number) => {
    setForms(forms.map(form => 
      form.id === id ? { ...form, [field]: value, error: undefined } : form
    ));
  };

  const validateForms = async (): Promise<boolean> => {
    let isValid = true;
    const updatedForms = forms.map(form => {
      let error = '';

      if (!form.longUrl) {
        error = 'URL is required';
        isValid = false;
      } else if (!validateUrl(form.longUrl)) {
        error = 'Invalid URL format';
        isValid = false;
      } else if (form.customShortcode && !validateShortcode(form.customShortcode)) {
        error = 'Invalid shortcode format (alphanumeric, 4-10 characters)';
        isValid = false;
      } else if (form.validity < 1) {
        error = 'Validity must be a positive number';
        isValid = false;
      }

      return { ...form, error };
    });

    setForms(updatedForms);

    if (!isValid) {
      await logEvent('warn', 'Form validation failed', { errors: updatedForms.filter(f => f.error).map(f => f.error) });
    }

    return isValid;
  };

  const handleShortenUrls = async () => {
    await logEvent('info', 'URL shortening process initiated', { formsCount: forms.length });
    
    const isValid = await validateForms();
    if (!isValid) return;

    setLoading(true);
    const newResults: ShortenedResult[] = [];

    try {
      for (const form of forms) {
        try {
          await logEvent('info', 'API call initiated for URL shortening', { 
            longUrl: form.longUrl,
            validity: form.validity,
            customShortcode: form.customShortcode 
          });

          const result = await shortenUrl(form.longUrl, form.validity, form.customShortcode);
          
          newResults.push({
            id: form.id,
            shortUrl: `${window.location.origin}/${result.shortcode}`,
            longUrl: form.longUrl,
            expiresAt: new Date(Date.now() + form.validity * 60 * 1000).toISOString(),
            shortcode: result.shortcode
          });

          await logEvent('success', 'URL shortened successfully', { 
            shortcode: result.shortcode,
            longUrl: form.longUrl 
          });
        } catch (error) {
          await logEvent('error', 'URL shortening failed', { 
            error: (error as Error).message,
            longUrl: form.longUrl 
          });
          throw error;
        }
      }

      setResults(newResults);
      showNotification('URLs shortened successfully! ✨');
      setForms([{ id: Date.now().toString(), longUrl: '', validity: 30, customShortcode: '' }]);
    } catch (error) {
      showNotification('Error shortening URLs', 'error');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, shortcode: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showNotification('Copied to clipboard! 📋');
      await logEvent('info', 'URL copied to clipboard', { shortcode });
    } catch (error) {
      showNotification('Failed to copy to clipboard', 'error');
    }
  };

  return (
    <div className="space-y-8">
      {/* Notification */}
      {notification.show && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-dark animate-slide-up ${
          notification.type === 'success' 
            ? 'bg-primary text-primary-foreground' 
            : 'bg-destructive text-destructive-foreground'
        }`}>
          {notification.message}
        </div>
      )}

      {/* URL Input Section */}
      <div className="bg-card rounded-xl border border-border shadow-dark p-6 space-y-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-gradient-primary p-2 rounded-lg">
            <Link className="h-5 w-5 text-primary-foreground" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Enter URLs to Shorten</h2>
        </div>
        
        {forms.map((form, index) => (
          <div key={form.id} className="bg-muted rounded-lg border border-border p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-primary">URL #{index + 1}</h3>
              {forms.length > 1 && (
                <button
                  onClick={() => removeUrlForm(form.id)}
                  className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                >
                  <Minus className="h-4 w-4" />
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Long URL Input */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-2">
                  <Link className="inline h-4 w-4 mr-1" />
                  Long URL *
                </label>
                <input
                  type="url"
                  value={form.longUrl}
                  onChange={(e) => updateForm(form.id, 'longUrl', e.target.value)}
                  placeholder="https://example.com/very-long-url"
                  className={`w-full px-4 py-3 bg-input border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all ${
                    form.error && form.error.includes('URL') 
                      ? 'border-destructive' 
                      : 'border-border focus:border-primary'
                  }`}
                />
                {form.error && form.error.includes('URL') && (
                  <p className="text-sm text-destructive mt-1">{form.error}</p>
                )}
              </div>

              {/* Validity Input */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  <Clock className="inline h-4 w-4 mr-1" />
                  Validity (minutes)
                </label>
                <input
                  type="number"
                  value={form.validity}
                  onChange={(e) => updateForm(form.id, 'validity', parseInt(e.target.value) || 30)}
                  min="1"
                  className={`w-full px-4 py-3 bg-input border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all ${
                    form.error && form.error.includes('Validity') 
                      ? 'border-destructive' 
                      : 'border-border focus:border-primary'
                  }`}
                />
                {form.error && form.error.includes('Validity') && (
                  <p className="text-sm text-destructive mt-1">{form.error}</p>
                )}
              </div>

              {/* Custom Shortcode Input */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  <Hash className="inline h-4 w-4 mr-1" />
                  Custom Code (Optional)
                </label>
                <input
                  type="text"
                  value={form.customShortcode}
                  onChange={(e) => updateForm(form.id, 'customShortcode', e.target.value)}
                  placeholder="abc123"
                  className={`w-full px-4 py-3 bg-input border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all ${
                    form.error && form.error.includes('shortcode') 
                      ? 'border-destructive' 
                      : 'border-border focus:border-primary'
                  }`}
                />
                {form.error && form.error.includes('shortcode') && (
                  <p className="text-sm text-destructive mt-1">{form.error}</p>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4">
          {forms.length < 5 && (
            <button
              onClick={addUrlForm}
              className="flex items-center space-x-2 px-6 py-3 bg-muted text-foreground border border-border rounded-lg hover:bg-accent hover:text-accent-foreground transition-all duration-300"
            >
              <Plus className="h-4 w-4" />
              <span>Add Another URL</span>
            </button>
          )}
          
          <button
            onClick={handleShortenUrls}
            disabled={loading}
            className="flex items-center space-x-2 px-8 py-3 bg-gradient-primary text-primary-foreground rounded-lg hover:shadow-golden transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent"></div>
                <span>Shortening...</span>
              </>
            ) : (
              <>
                <Link className="h-4 w-4" />
                <span>Shorten URLs</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results Section */}
      {results.length > 0 && (
        <div className="bg-card rounded-xl border border-border shadow-dark p-6 space-y-6 animate-fade-in">
          <h2 className="text-2xl font-bold text-foreground flex items-center space-x-3">
            <div className="bg-gradient-primary p-2 rounded-lg">
              <Copy className="h-5 w-5 text-primary-foreground" />
            </div>
            <span>Your Golden Links</span>
          </h2>
          
          <div className="grid gap-4">
            {results.map((result) => (
              <div key={result.id} className="bg-muted rounded-lg border border-border p-6 hover:shadow-golden transition-all duration-300">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-center">
                  {/* Original URL */}
                  <div className="lg:col-span-2">
                    <div className="text-sm text-muted-foreground mb-1">Original URL</div>
                    <div className="text-foreground font-medium truncate" title={result.longUrl}>
                      {result.longUrl.length > 60 ? `${result.longUrl.substring(0, 60)}...` : result.longUrl}
                    </div>
                  </div>

                  {/* Short URL */}
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Short URL</div>
                    <div className="flex items-center space-x-2">
                      <span className="text-primary font-bold">{result.shortUrl}</span>
                      <button
                        onClick={() => copyToClipboard(result.shortUrl, result.shortcode)}
                        className="p-1 text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Expires */}
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Expires</div>
                    <div className="bg-secondary/20 text-secondary px-3 py-1 rounded-full text-sm font-medium">
                      {new Date(result.expiresAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                
                {/* Copy Button */}
                <div className="mt-4 pt-4 border-t border-border">
                  <button
                    onClick={() => copyToClipboard(result.shortUrl, result.shortcode)}
                    className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:shadow-golden transition-all duration-300"
                  >
                    <Copy className="h-4 w-4" />
                    <span>Copy Link</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UrlShortener;