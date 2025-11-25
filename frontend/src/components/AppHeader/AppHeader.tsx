// AppHeader Component - Navigation header with Clerk auth
import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { SignedIn, SignedOut, UserButton, useClerk } from '@clerk/clerk-react';
import { Button, Badge } from '@sendle/sds-ui';
import { useUserStats } from '../../hooks/useAnnotations';
import './AppHeader.scss';

export const AppHeader: React.FC = () => {
  const location = useLocation();
  const { openSignIn } = useClerk();
  const { stats, refresh: refreshStats } = useUserStats();

  // Refresh stats periodically
  useEffect(() => {
    const interval = setInterval(() => {
      refreshStats();
    }, 60000); // Refresh every minute

    return () => clearInterval(interval);
  }, [refreshStats]);

  const getActiveMenuItem = () => {
    const path = location.pathname;
    if (path === '/') return 'home';
    if (path.startsWith('/traces') || path.startsWith('/trace/')) return 'traces';
    if (path === '/import') return 'import';
    return 'home';
  };

  const activeMenu = getActiveMenuItem();

  return (
    <header className="app-header">
      <div className="app-header__container">
        <Link to="/" className="app-header__logo">
          <img src="/sendle-logo.svg" alt="Sendle" />
        </Link>

        <nav className="app-header__nav">
          <Link
            to="/"
            className={`app-header__nav-item ${activeMenu === 'home' ? 'app-header__nav-item--active' : ''}`}
          >
            Home
          </Link>
          <Link
            to="/traces"
            className={`app-header__nav-item ${activeMenu === 'traces' ? 'app-header__nav-item--active' : ''}`}
          >
            Traces
          </Link>
          <Link
            to="/import"
            className={`app-header__nav-item ${activeMenu === 'import' ? 'app-header__nav-item--active' : ''}`}
          >
            Import CSV
          </Link>
        </nav>

        <div className="app-header__right">
          {stats && (
            <div className="app-header__stats">
              <span className="app-header__stats-text">
                Annotations: {stats.total_annotations}
              </span>
            </div>
          )}

          <SignedIn>
            <UserButton />
          </SignedIn>

          <SignedOut>
            <Button variant="primary" onClick={() => openSignIn()}>
              Sign In
            </Button>
          </SignedOut>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
