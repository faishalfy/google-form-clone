/**
 * Home Page
 * 
 * The landing page of the application.
 * Shows different content based on authentication status.
 */

import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common';
import './HomePage.css';

const HomePage = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="home-page">
      <section className="hero">
        <h1 className="hero-title">
          Create Beautiful Forms <span className="text-primary">Effortlessly</span>
        </h1>
        <p className="hero-subtitle">
          Build surveys, collect data, and analyze responses with our easy-to-use
          form builder. Get started in minutes.
        </p>

        <div className="hero-actions">
          {isAuthenticated ? (
            <>
              <Link to="/forms/create">
                <Button variant="primary" size="large">
                  Create New Form
                </Button>
              </Link>
              <Link to="/forms">
                <Button variant="outline" size="large">
                  View My Forms
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link to="/register">
                <Button variant="primary" size="large">
                  Get Started Free
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="large">
                  Sign In
                </Button>
              </Link>
            </>
          )}
        </div>
      </section>

      <section className="features">
        <h2 className="features-title">Why Choose Form Builder?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📝</div>
            <h3>Easy to Use</h3>
            <p>Intuitive drag-and-drop interface makes form creation a breeze.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🎨</div>
            <h3>Multiple Question Types</h3>
            <p>Text, multiple choice, checkboxes, dropdowns and more.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>Secure & Private</h3>
            <p>Your data is encrypted and stored securely.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📱</div>
            <h3>Responsive Design</h3>
            <p>Forms work perfectly on desktop, tablet, and mobile.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
