import { createContext, useContext, useState, useEffect } from 'react';
import { login as loginApi } from '../api/authApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('pdi_token');
    const savedUser = localStorage.getItem('pdi_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, motDePasse) => {
    const response = await loginApi(email, motDePasse);
    const { token, email: userEmail, role, nom, prenom } = response.data;
    const userData = { email: userEmail, role, nom, prenom };
    localStorage.setItem('pdi_token', token);
    localStorage.setItem('pdi_user', JSON.stringify(userData));
    setToken(token);
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('pdi_token');
    localStorage.removeItem('pdi_user');
    setToken(null);
    setUser(null);
  };

  const isAdmin = () => user?.role === 'ROLE_ADMIN';
  const isAgent = () => user?.role === 'ROLE_AGENT' || isAdmin();
  const isResponsable = () => user?.role === 'ROLE_RESPONSABLE' || isAdmin();

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, isAdmin, isAgent, isResponsable }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth doit être utilisé dans AuthProvider');
  return context;
};
