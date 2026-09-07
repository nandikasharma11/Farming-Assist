import React, { createContext, useContext, useEffect, useState } from 'react';
import { api, clearTokens, getAccessToken, setTokens } from '../services/api';
import type { UserProfile } from '../services/types';

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  loading: boolean;
  login: (credentials: any) => Promise<void>;
  signup: (details: any) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setTokenState] = useState<string | null>(getAccessToken());
  const [loading, setLoading] = useState<boolean>(true);

  const fetchProfile = async () => {
    try {
      const profile = await api.getProfile();
      setUser(profile);
    } catch {
      setUser(null);
      clearTokens();
      setTokenState(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (getAccessToken()) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (credentials: any) => {
    const res = await api.login(credentials);
    setTokens(res.access_token, res.refresh_token);
    setTokenState(res.access_token);
    await fetchProfile();
  };

  const signup = async (details: any) => {
    const res = await api.signup(details);
    setTokens(res.access_token, res.refresh_token);
    setTokenState(res.access_token);
    await fetchProfile();
  };

  const logout = () => {
    clearTokens();
    setUser(null);
    setTokenState(null);
  };

  const refreshProfile = async () => {
    await fetchProfile();
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout, refreshProfile }}>
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
