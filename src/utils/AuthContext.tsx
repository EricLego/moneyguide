import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/router';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const checkLoggedIn = async () => {
      try {
        console.log('Checking auth status...');
        const response = await fetch('/api/auth/me', {
          credentials: 'include' // Include cookies in the request
        });
        
        if (response.ok) {
          try {
            const data = await response.json();
            console.log('Auth check response:', data);
            
            if (data.success) {
              setUser(data.data);
            }
          } catch (parseError) {
            console.error('Error parsing auth check response:', parseError);
            setUser(null);
          }
        } else {
          console.log('Auth check failed:', response.status);
          
          // If API returns 401, 403 or 500+, user is not authenticated
          if (response.status === 401 || response.status === 403 || response.status >= 500) {
            setUser(null);
            
            // For server errors, log additional information
            if (response.status >= 500) {
              console.warn(`Server error during auth check: ${response.status} ${response.statusText}`);
            }
          }
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
      } finally {
        setLoading(false);
      }
    };

    checkLoggedIn();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Attempting login...');
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include' // Include cookies in the request
      });

      if (!response.ok) {
        // Safely parse response, handling cases where response might not be valid JSON
        try {
          const errorData = await response.json();
          console.error('Login failed:', errorData);
          throw new Error(errorData.message || `Login failed (${response.status})`);
        } catch (parseError) {
          // If we can't parse as JSON, use the status text or a generic message
          console.error('Login failed with unparseable response:', response.statusText);
          throw new Error(
            response.status === 504 
              ? 'Server timeout - database connection issue' 
              : `Login failed (${response.status}: ${response.statusText})`
          );
        }
      }

      // Safely parse the success response
      let data;
      try {
        data = await response.json();
        console.log('Login successful:', data);

        setUser(data.data);
        router.push('/dashboard');
      } catch (parseError) {
        console.error('Error parsing successful login response:', parseError);
        throw new Error('Error processing login response');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Attempting signup...');
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
        credentials: 'include' // Include cookies in the request
      });

      if (!response.ok) {
        // Safely parse response, handling cases where response might not be valid JSON
        try {
          const errorData = await response.json();
          console.error('Signup failed:', errorData);
          throw new Error(errorData.message || `Signup failed (${response.status})`);
        } catch (parseError) {
          // If we can't parse as JSON, use the status text or a generic message
          console.error('Signup failed with unparseable response:', response.statusText);
          throw new Error(
            response.status === 504 
              ? 'Server timeout - database connection issue' 
              : `Signup failed (${response.status}: ${response.statusText})`
          );
        }
      }

      // Safely parse the success response
      let data;
      try {
        data = await response.json();
        console.log('Signup successful:', data);

        setUser(data.data);
        router.push('/dashboard');
      } catch (parseError) {
        console.error('Error parsing successful signup response:', parseError);
        throw new Error('Error processing signup response');
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    
    try {
      console.log('Logging out...');
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include' // Include cookies in the request
      });
      
      setUser(null);
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        logout,
        error
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};