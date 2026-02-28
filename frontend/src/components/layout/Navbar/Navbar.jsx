/**
 * Navbar Component
 * 
 * The main navigation bar that appears at the top of every page.
 * Shows different options based on authentication state.
 */

import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import Button from '../../common/Button';
import './Navbar.css';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  /**
   * Handle logout
   * Clears auth state and redirects to login
   */
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo/Brand */}
        <Link to="/" className="navbar-brand">
          <span className="navbar-logo">📝</span>
          <span className="navbar-title">Form Builder</span>
        </Link>

        {/* Navigation Links */}
        <div className="navbar-links">
          {isAuthenticated ? (
            <>
              {/* Links for authenticated users */}
              <Link to="/forms" className="navbar-link">
                My Forms
              </Link>
              <Link to="/forms/create" className="navbar-link">
                Create Form
              </Link>
              
              {/* User info and logout */}
              <div className="navbar-user">
                <span className="navbar-user-name">
                  Hello, {user?.name || 'User'}
                </span>
                <Button
                  variant="outline"
                  size="small"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </div>
            </>
          ) : (
            <>
              {/* Links for unauthenticated users */}
              <Link to="/login" className="navbar-link">
                Login
              </Link>
              <Link to="/register">
                <Button variant="primary" size="small">
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
