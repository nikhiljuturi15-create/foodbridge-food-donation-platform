import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../types';
import { api } from '../api/client';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('foodbridge_token');
    const storedUser = localStorage.getItem('foodbridge_user');

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser) as User;
        const normalizedUser = {
          ...parsedUser,
          email: String(parsedUser.email || '').trim().toLowerCase(),
        } as User;

        setToken(storedToken);
        setUser(normalizedUser);

        api.get('/auth/me')
          .then((res) => {
            if (res.data.user) {
              const refreshedUser = { ...res.data.user, email: String(res.data.user.email || '').trim().toLowerCase() } as User;
              setUser(refreshedUser);
              localStorage.setItem('foodbridge_user', JSON.stringify(refreshedUser));
            }
          })
          .catch(() => {
            logout();
          })
          .finally(() => setIsLoading(false));
        return;
      } catch (e) {
        logout();
      }
    }
    setIsLoading(false);
  }, []);

  const login = (newToken: string, newUser: User) => {
    const normalizedUser = {
      ...newUser,
      email: String(newUser.email || '').trim().toLowerCase(),
      role: newUser.role,
    } as User;

    localStorage.setItem('foodbridge_token', newToken);
    localStorage.setItem('foodbridge_user', JSON.stringify(normalizedUser));
    setToken(newToken);
    setUser(normalizedUser);
  };

  const logout = () => {
    localStorage.removeItem('foodbridge_token');
    localStorage.removeItem('foodbridge_user');
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedFields: Partial<User>) => {
    if (user) {
      const updated = { ...user, ...updatedFields };
      setUser(updated);
      localStorage.setItem('foodbridge_user', JSON.stringify(updated));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
