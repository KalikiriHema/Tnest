import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthSession, UserRole } from '../types';
import { api } from '../api';

interface AuthContextType {
  user: User | null;
  session: AuthSession | null;
  isAuthenticated: boolean;
  activePersona: 'client' | 'doer';
  setActivePersona: (persona: 'client' | 'doer') => void;
  login: (email: string, pass: string) => Promise<void>;
  googleLogin: (idToken: string, role?: string, companyName?: string, headline?: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  setAuthSession: (session: AuthSession) => void;
  updateUser: (updatedFields: Partial<User>) => void;
  quickSwitch: (type: 'client' | 'ugc_pro' | 'editor_pro' | 'dual' | 'john' | 'admin') => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [activePersona, setActivePersonaState] = useState<'client' | 'doer'>('client');
  const [isLoading, setIsLoading] = useState(true);

  const setActivePersona = (persona: 'client' | 'doer') => {
    setActivePersonaState(persona);
    localStorage.setItem('tnest_active_persona', persona);
  };

  useEffect(() => {
    const saved = localStorage.getItem('tnest_session');
    const savedPersona = localStorage.getItem('tnest_active_persona') as 'client' | 'doer' | null;
    if (saved) {
      try {
        const parsed: AuthSession = JSON.parse(saved);
        setSession(parsed);
        if (savedPersona === 'doer' || savedPersona === 'client') {
          setActivePersonaState(savedPersona);
        } else if (parsed.user.role === 'Professional') {
          setActivePersonaState('doer');
        } else {
          setActivePersonaState('client');
        }

        // Fetch latest profile in background to keep completion % accurate
        api.getCurrentUser().then((latestUser) => {
          if (latestUser && latestUser.id) {
            setSession((prev) => {
              if (!prev) return null;
              const updatedSession = { ...prev, user: { ...prev.user, ...latestUser } };
              localStorage.setItem('tnest_session', JSON.stringify(updatedSession));
              return updatedSession;
            });
          }
        }).catch(() => {});
      } catch {
        localStorage.removeItem('tnest_session');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, pass: string) => {
    const data = await api.login({ email, password: pass });
    setSession(data);
    const savedPersona = localStorage.getItem('tnest_active_persona') as 'client' | 'doer' | null;
    if (savedPersona) {
      setActivePersonaState(savedPersona);
    } else if (data.user.role === 'Professional') {
      setActivePersonaState('doer');
    } else {
      setActivePersonaState('client');
    }
    localStorage.setItem('tnest_session', JSON.stringify(data));
  };

  const googleLogin = async (idToken: string, role?: string, companyName?: string, headline?: string) => {
    const data = await api.googleLogin({ idToken, role, companyName, headline });
    setSession(data);
    const savedPersona = localStorage.getItem('tnest_active_persona') as 'client' | 'doer' | null;
    if (savedPersona) {
      setActivePersonaState(savedPersona);
    } else if (data.user.role === 'Professional') {
      setActivePersonaState('doer');
    } else {
      setActivePersonaState('client');
    }
    localStorage.setItem('tnest_session', JSON.stringify(data));
  };

  const register = async (formData: any) => {
    const data = await api.register(formData);
    setSession(data);
    if (data.user.role === 'Professional') {
      setActivePersonaState('doer');
    } else {
      setActivePersonaState('client');
    }
    localStorage.setItem('tnest_session', JSON.stringify(data));
  };

  const logout = () => {
    setSession(null);
    setActivePersonaState('client');
    localStorage.removeItem('tnest_session');
  };

  const setAuthSession = (newSession: AuthSession) => {
    setSession(newSession);
    if (newSession.user.role === 'Professional') {
      setActivePersonaState('doer');
    } else {
      setActivePersonaState('client');
    }
    localStorage.setItem('tnest_session', JSON.stringify(newSession));
  };

  const updateUser = (updatedFields: Partial<User>) => {
    setSession(prev => {
      if (!prev) return null;
      const updatedUser = { ...prev.user, ...updatedFields };
      const newSession = { ...prev, user: updatedUser };
      localStorage.setItem('tnest_session', JSON.stringify(newSession));
      return newSession;
    });
  };

  const quickSwitch = async (type: 'client' | 'ugc_pro' | 'editor_pro' | 'dual' | 'john' | 'admin') => {
    let email = '';
    let pass = '';
    if (type === 'client') {
      email = 'hema@gmail.com';
      pass = 'hema1234';
    } else if (type === 'ugc_pro') {
      email = 'navya@gmail.com';
      pass = 'navya1234';
    } else if (type === 'editor_pro') {
      email = 'navya@gmail.com';
      pass = 'navya1234';
    } else if (type === 'dual' || type === 'john') {
      email = 'john@gmail.com';
      pass = 'Password123!';
    } else if (type === 'admin') {
      email = 'admin@tnest.com';
      pass = 'AdminPass123!';
    }
    await login(email, pass);
  };

  return (
    <AuthContext.Provider
      value={{
        user: session?.user || null,
        session,
        isAuthenticated: !!session?.user,
        activePersona,
        setActivePersona,
        login,
        googleLogin,
        register,
        logout,
        setAuthSession,
        updateUser,
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
