/**
 * Application Entry Point
 * 
 * This file bootstraps the React application.
 * It renders the App component into the DOM.
 * 
 * BEGINNER TIP:
 * - StrictMode helps identify potential problems in development
 * - createRoot is the React 18+ way to render apps
 * - We import global styles (index.css) here
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// Find the root element in index.html and render our app
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
