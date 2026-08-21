import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => {
    const saved = localStorage.getItem('arff-session');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        localStorage.removeItem('arff-session');
      }
    }
    return null;
  });

  useEffect(() => {
    function handleUnauthorized() {
      setSession(null);
    }
    window.addEventListener('arff-unauthorized', handleUnauthorized);
    return () => window.removeEventListener('arff-unauthorized', handleUnauthorized);
  }, []);

  function login(sessionData) {
    localStorage.setItem('arff-session', JSON.stringify(sessionData));
    setSession(sessionData);
  }

  function logout() {
    localStorage.removeItem('arff-session');
    setSession(null);
  }

  return (
    <AuthContext.Provider value={{ session, user: session?.user, token: session?.token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth harus digunakan di dalam AuthProvider');
  }
  return context;
}
