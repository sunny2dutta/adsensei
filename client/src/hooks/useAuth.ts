import { useState, useEffect } from 'react';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check if user is authenticated and validate the session
    const checkAuthentication = async () => {
      const authStatus = localStorage.getItem('isAuthenticated') === 'true';
      
      if (authStatus) {
        try {
          // Get user ID from localStorage to validate session
          const userId = localStorage.getItem('currentUserId');
          
          if (!userId) {
            // No user ID stored, clear authentication
            localStorage.removeItem('isAuthenticated');
            localStorage.removeItem('currentUser');
            setIsAuthenticated(false);
            setUser(null);
            setIsLoading(false);
            return;
          }

          // Validate the session with the server
          const response = await fetch('/api/auth/me', {
            method: 'GET',
            credentials: 'include',
            headers: {
              'x-user-id': userId,
            },
          });
          
          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
            setIsAuthenticated(true);
          } else {
            // Invalid session, clear localStorage
            localStorage.removeItem('isAuthenticated');
            localStorage.removeItem('currentUserId');
            localStorage.removeItem('currentUser');
            setIsAuthenticated(false);
            setUser(null);
          }
        } catch (error) {
          // Network error or invalid session
          localStorage.removeItem('isAuthenticated');
          localStorage.removeItem('currentUserId');
          localStorage.removeItem('currentUser');
          setIsAuthenticated(false);
          setUser(null);
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
      
      setIsLoading(false);
    };

    checkAuthentication();
  }, []);

  // Listen for storage changes to react to login/logout in other tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'isAuthenticated') {
        const authStatus = e.newValue === 'true';
        setIsAuthenticated(authStatus);
        
        if (authStatus) {
          const stored = localStorage.getItem('currentUser');
          setUser(stored ? JSON.parse(stored) : null);
        } else {
          setUser(null);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const login = (userData?: any) => {
    localStorage.setItem('isAuthenticated', 'true');
    if (userData) {
      localStorage.setItem('currentUserId', userData.id);
      localStorage.setItem('currentUser', JSON.stringify(userData));
      setUser(userData);
    }
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('currentUserId');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userOnboardingData');
    setIsAuthenticated(false);
    setUser(null);
    window.location.href = '/login';
  };

  return {
    isAuthenticated,
    user,
    isLoading,
    login,
    logout,
  };
}