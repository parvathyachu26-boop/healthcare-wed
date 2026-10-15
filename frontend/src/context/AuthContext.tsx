import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  // Accept a pre-fetched token response object (used by both doctor and patient flows)
  login: (tokenResponse: any) => void;
  demoLogin: (role: string) => Promise<void>;
  logout: () => void;
  isDoctor: boolean;
  isReceptionist: boolean;
  isAdmin: boolean;
  isPatient: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function tokenRespToUser(res: any): User {
  return {
    id: res.user_id,
    username: res.username,
    full_name: res.full_name,
    role: res.role,
    department: res.department || '',
    email: res.email || `${res.username}@mediassist.health`,
    is_active: true,
    is_demo: ['dr.patel', 'patient.akhil'].includes(res.username),
  };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('mediassist_token'));
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadUser() {
      try {
        if (token) {
          const profile = await api.getCurrentUser();
          setUser({ ...profile, is_demo: ['dr.patel', 'patient.akhil'].includes(profile.username) });
        } else {
          // No auto-login — show landing page instead
          setUser(null);
        }
      } catch (err) {
        // Token expired or invalid — clear it
        localStorage.removeItem('mediassist_token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  // Login accepts a full token response object from any flow (patient or doctor)
  const login = (tokenResponse: any) => {
    localStorage.setItem('mediassist_token', tokenResponse.access_token);
    setToken(tokenResponse.access_token);
    setUser(tokenRespToUser(tokenResponse));
  };

  const demoLogin = async (role: string) => {
    setLoading(true);
    try {
      const res = role === 'patient' ? await api.demoPatientLogin() : await api.demoLogin(role);
      localStorage.setItem('mediassist_token', res.access_token);
      setToken(res.access_token);
      setUser(tokenRespToUser(res));
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('mediassist_token');
    setToken(null);
    setUser(null);
  };

  const isDoctor = user?.role === 'doctor' || user?.role === 'admin';
  const isReceptionist = user?.role === 'receptionist';
  const isAdmin = user?.role === 'admin';
  const isPatient = user?.role === 'patient';

  return (
    <AuthContext.Provider value={{
      user, token, loading, login, demoLogin, logout,
      isDoctor, isReceptionist, isAdmin, isPatient,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
