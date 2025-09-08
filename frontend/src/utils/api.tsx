import { logEvent } from './loggingMiddleware';

const API_BASE = 'http://20.244.56.144/evaluation-service';

let authToken = '';

export const getAuthToken = async (): Promise<string> => {
  try {
    const credentials = {
      email: "sanskarsoni663@gmail.com",
      name: "sanskar soni",
      rollNo: "2201641530154",
      accessCode: "sAWTuR",
      clientID: "c1ab3dbb-9474-45c2-adaf-35884c97bac1",
      clientSecret: "aNDjAVpyrQEhVmbb"
    };

    // Make actual API call to authentication endpoint
    const response = await fetch(`${API_BASE}/auth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials)
    });

    if (!response.ok) {
      throw new Error(`Authentication failed: ${response.status}`);
    }

    const data = await response.json();
    authToken = data.token; // Assuming the response contains a 'token' field
    
    await logEvent('info', 'Auth token obtained', { 
      tokenLength: authToken.length,
      expiresIn: data.expiresIn 
    });
    
    return authToken;
  } catch (error) {
    await logEvent('error', 'Failed to obtain auth token', { 
      error: (error as Error).message 
    });
    throw new Error('Failed to obtain authentication token');
  }
};

export const shortenUrl = async (longUrl: string, validity: number, customShortcode?: string) => {
  try {
    await logEvent('info', 'Initiating URL shortening API call', { 
      longUrl, 
      validity, 
      customShortcode 
    });

    // Since this is a frontend assignment, we'll simulate the API call
    // and store data in localStorage
    const shortcode = customShortcode || generateShortcode();
    const expiresAt = new Date(Date.now() + validity * 60 * 1000).toISOString();
    
    // Store in localStorage
    const storedUrls = localStorage.getItem('shortenedUrls');
    const urlMappings = storedUrls ? JSON.parse(storedUrls) : {};
    
    // Check if custom shortcode already exists
    if (customShortcode && urlMappings[customShortcode]) {
      throw new Error('Custom shortcode already exists');
    }
    
    urlMappings[shortcode] = {
      longUrl,
      shortcode,
      createdAt: new Date().toISOString(),
      expiresAt,
      clicks: 0,
      clickDetails: []
    };
    
    localStorage.setItem('shortenedUrls', JSON.stringify(urlMappings));
    
    await logEvent('success', 'URL shortened successfully', { 
      shortcode, 
      longUrl,
      expiresAt 
    });

    return { shortcode, expiresAt };
  } catch (error) {
    await logEvent('error', 'URL shortening failed', { 
      error: (error as Error).message, 
      longUrl 
    });
    throw error;
  }
};

export const getStats = async () => {
  try {
    await logEvent('info', 'Fetching URL statistics');

    // Get data from localStorage
    const storedUrls = localStorage.getItem('shortenedUrls');
    const urlMappings = storedUrls ? JSON.parse(storedUrls) : {};
    
    const stats = Object.values(urlMappings).map((url: any) => ({
      shortcode: url.shortcode,
      longUrl: url.longUrl,
      shortUrl: `${window.location.origin}/${url.shortcode}`,
      createdAt: url.createdAt,
      expiresAt: url.expiresAt,
      totalClicks: url.clicks || 0,
      clickDetails: url.clickDetails || []
    }));

    await logEvent('success', 'Statistics fetched successfully', { count: stats.length });
    return stats;
  } catch (error) {
    await logEvent('error', 'Failed to fetch statistics', { error: (error as Error).message });
    throw error;
  }
};

const generateShortcode = (): string => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

export { authToken };