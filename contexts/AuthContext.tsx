"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  username: string | null;
  isAuthenticated: boolean;
  initialized: boolean;
  login: (username: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [username, setUsername] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Load username from localStorage on mount
  useEffect(() => {
    const savedUsername = localStorage.getItem('username');
    if (savedUsername) {
      setUsername(savedUsername);
      setIsAuthenticated(true);
    }
    setInitialized(true);
  }, []);

  const login = (username: string) => {
    setUsername(username);
    setIsAuthenticated(true);
    localStorage.setItem('username', username);
  };

  const logout = () => {
    setUsername(null);
    setIsAuthenticated(false);
    localStorage.removeItem('username');
  };

  return (
    <AuthContext.Provider value={{ username, isAuthenticated, initialized, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}