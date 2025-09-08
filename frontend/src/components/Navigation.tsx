import { Link as RouterLink, useLocation } from 'react-router-dom';
import { Link, BarChart, Zap } from 'lucide-react';

const Navigation = () => {
  const location = useLocation();

  return (
    <nav className="bg-card border-b border-border shadow-dark">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-primary p-2 rounded-lg golden-glow">
              <Zap className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              LinkGold
            </span>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-6">
            <RouterLink
              to="/"
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                location.pathname === '/' 
                  ? 'bg-primary text-primary-foreground shadow-golden' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <Link className="h-4 w-4" />
              <span className="font-medium">Shorten URL</span>
            </RouterLink>
            
            <RouterLink
              to="/stats"
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                location.pathname === '/stats' 
                  ? 'bg-primary text-primary-foreground shadow-golden' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <BarChart className="h-4 w-4" />
              <span className="font-medium">Statistics</span>
            </RouterLink>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;