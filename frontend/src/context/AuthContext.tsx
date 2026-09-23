import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthSession, UserRole } from '../types';
import { api } from '../api';

interface AuthContextType {
  user: User | null;
  session: AuthSession | null;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  quickSwitch: (type: 'client' | 'ugc_pro' | 'editor_pro') => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('creative_hub_session');
    if (saved) {
      try {
        const parsed: AuthSession = JSON.parse(saved);
        setSession(parsed);
      } catch {
        localStorage.removeItem('creative_hub_session');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, pass: string) => {
    const data = await api.login({ email, password: pass });
    setSession(data);
    localStorage.setItem('creative_hub_session', JSON.stringify(data));
  };

  const register = async (formData: any) => {
    const data = await api.register(formData);
    setSession(data);
    localStorage.setItem('creative_hub_session', JSON.stringify(data));
  };

  const logout = () => {
    setSession(null);
    localStorage.removeItem('creative_hub_session');
  };

  const quickSwitch = async (type: 'client' | 'ugc_pro' | 'editor_pro') => {
    let email = '';
    let pass = '';
    if (type === 'client') {
      email = 'client@glowskin.com';
      pass = 'ClientPass123!';
    } else if (type === 'ugc_pro') {
      email = 'priya.ugc@creator.com';
      pass = 'CreatorPass123!';
    } else if (type === 'editor_pro') {
      email = 'arjun.edits@creator.com';
      pass = 'EditorPass123!';
    }
    await login(email, pass);
  };

  return (
    <AuthContext.Provider
      value={{
        user: session?.user || null,
        session,
        isAuthenticated: !!session?.user,
        login,
        register,
        logout,
        quickSwitch,
        isLoading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
