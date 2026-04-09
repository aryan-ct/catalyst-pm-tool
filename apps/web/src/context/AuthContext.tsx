import React, { createContext, useContext, useState, useEffect } from 'react';
import { RESOURCE_API, Resource } from '../api/resource.api';
import { useNavigate, useLocation } from 'react-router-dom';

interface AuthContextType {
  user: Resource | null;
  loading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<Resource | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const fetchUser = async (token: string) => {
    localStorage.setItem('authToken', token);
    try {
      const userData = await RESOURCE_API.findMe();
      setUser(userData);
      navigate('/');
    } catch (error) {
      console.error("Failed to fetch user", error);
      localStorage.removeItem('authToken');
      setUser(null);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          const userData = await RESOURCE_API.findMe();
          setUser(userData);
        } catch (error) {
          console.error("Failed to init user", error);
          localStorage.removeItem('authToken');
          setUser(null);
          // Only redirect if trying to access protected routes
          if (location.pathname !== '/login') {
             navigate('/login');
          }
        }
      } else {
        setUser(null);
        if (location.pathname !== '/login') {
           navigate('/login');
        }
      }
      setLoading(false);
    };

    initAuth();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only on mount

  const login = async (token: string) => {
    await fetchUser(token);
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
