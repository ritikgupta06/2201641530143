import UrlShortener from '../components/UrlShortener';

const HomePage = () => {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-6 py-12">
        <h1 className="text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          Transform Long URLs Into Gold
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          Create premium short links that shine with our golden-themed URL shortener. 
          Elegant, fast, and reliable link management for the modern web.
        </p>
        <div className="flex items-center justify-center space-x-8 pt-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">∞</div>
            <div className="text-sm text-muted-foreground">Unlimited Links</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">⚡</div>
            <div className="text-sm text-muted-foreground">Lightning Fast</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">🔒</div>
            <div className="text-sm text-muted-foreground">Secure & Private</div>
          </div>
        </div>
      </div>

      {/* URL Shortener Component */}
      <UrlShortener />
    </div>
  );
};

export default HomePage;