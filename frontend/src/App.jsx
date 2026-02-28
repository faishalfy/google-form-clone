/**
 * Main Application Component
 * 
 * This is the root component that sets up:
 * - React Router for navigation
 * - Authentication context provider
 * - Layout (Navbar, Footer)
 * - All routes
 * 
 * BEGINNER TIP:
 * - BrowserRouter enables client-side routing
 * - Routes container holds all Route definitions
 * - Route maps a URL path to a component
 * - ProtectedRoute wraps routes that require authentication
 * 
 * ROUTE STRUCTURE:
 * - /                        - Home (public)
 * - /login                   - Login (public)
 * - /register                - Register (public)
 * - /forms                   - Form list (protected)
 * - /forms/create            - Create new form (protected)
 * - /forms/:id               - Form preview (protected)
 * - /forms/:id/edit          - Edit form basics (protected)
 * - /forms/:id/builder       - Form builder - manage questions (protected)
 * - /forms/:id/respond       - Fill and submit form (public)
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar, Footer } from './components/layout';
import { ProtectedRoute } from './components/auth';
import {
  HomePage,
  LoginPage,
  RegisterPage,
  FormListPage,
  FormDetailPage,
  CreateFormPage,
  EditFormPage,
  FormBuilderPage,
  FormAnalyticsPage,
  RespondFormPage,
  NotFoundPage,
} from './pages';
import './App.css';

/**
 * App Component
 * 
 * The main application component that wraps everything
 * with providers and sets up routing.
 */
function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          {/* Navigation Bar - appears on all pages */}
          <Navbar />

          {/* Main content area */}
          <main className="main-content">
            <Routes>
              {/* Public Routes - accessible without login */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Protected Routes - require authentication */}
              <Route
                path="/forms"
                element={
                  <ProtectedRoute>
                    <FormListPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/forms/create"
                element={
                  <ProtectedRoute>
                    <CreateFormPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/forms/:id"
                element={
                  <ProtectedRoute>
                    <FormDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/forms/:id/edit"
                element={
                  <ProtectedRoute>
                    <EditFormPage />
                  </ProtectedRoute>
                }
              />
              
              {/* Form Builder - manage questions (protected) */}
              <Route
                path="/forms/:id/builder"
                element={
                  <ProtectedRoute>
                    <FormBuilderPage />
                  </ProtectedRoute>
                }
              />

              {/* Form Analytics - responses and statistics (protected) */}
              <Route
                path="/forms/:id/analytics"
                element={
                  <ProtectedRoute>
                    <FormAnalyticsPage />
                  </ProtectedRoute>
                }
              />

              {/* Respondent View - fill and submit form (public) */}
              <Route path="/forms/:id/respond" element={<RespondFormPage />} />

              {/* 404 - Catch all unmatched routes */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>

          {/* Footer - appears on all pages */}
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
