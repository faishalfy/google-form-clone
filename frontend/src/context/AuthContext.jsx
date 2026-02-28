/**
 * Authentication Context
 * 
 * This context provides authentication state and methods throughout the app.
 * It allows any component to access:
 * - Current user information
 * - Login/logout/register functions
 * - Authentication status
 * 
 * BEGINNER TIP:
 * - Context is React's way of sharing data without prop drilling
 * - useContext hook accesses the context value
 * - Provider component wraps the app to make context available
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as authService from '../services/authService';

// Create the context with default values
const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  register: async () => {},
  logout: () => {},
});

/**
 * AuthProvider Component
 * 
 * Wraps the application and provides authentication state to all children.
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 */
export const AuthProvider = ({ children }) => {
  // State for user data
  const [user, setUser] = useState(null);
  
  // State to track if initial auth check is complete
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Check if user is already logged in on mount
   * This runs once when the app loads
   */
  useEffect(() => {
    const initializeAuth = () => {
      // Check if there's a stored user
      const storedUser = authService.getCurrentUser();
      const isAuth = authService.isAuthenticated();
      
      if (isAuth && storedUser) {
        setUser(storedUser);
      }
      
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  /**
   * Login function
   * 
   * @param {string} email - User's email
   * @param {string} password - User's password
   */
  const login = useCallback(async (email, password) => {
    const data = await authService.login({ email, password });
    setUser(data.user);
    return data;
  }, []);

  /**
   * Register function
   * 
   * @param {string} name - User's name
   * @param {string} email - User's email
   * @param {string} password - User's password
   */
  const register = useCallback(async (name, email, password) => {
    const data = await authService.register({ name, email, password });
    setUser(data.user);
    return data;
  }, []);

  /**
   * Logout function
   * Clears user state and stored credentials
   */
  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
  }, []);

  // Value object that will be provided to consumers
  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to use authentication context
 * 
 * @returns {Object} - Authentication context value
 * @throws {Error} - If used outside of AuthProvider
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default AuthContext;
