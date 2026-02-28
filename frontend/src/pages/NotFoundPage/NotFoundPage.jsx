/**
 * Not Found Page (404)
 * 
 * Displayed when user navigates to a non-existent route.
 */

import { Link } from 'react-router-dom';
import { Button } from '../../components/common';
import './NotFoundPage.css';

const NotFoundPage = () => {
  return (
    <div className="not-found-page">
      <div className="not-found-content">
        <h1 className="not-found-code">404</h1>
        <h2 className="not-found-title">Page Not Found</h2>
        <p className="not-found-description">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/">
          <Button variant="primary">Go to Home</Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
