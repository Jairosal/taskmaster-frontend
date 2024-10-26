import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from '../utils/axiosConfig';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const logoutUser = useCallback(() => {
    setUser(null);
    localStorage.removeItem('token');
    navigate('/login');
  }, [navigate]);

  const fetchUser = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    
    try {
      const response = await axios.get('/api/profile/');
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      logoutUser();
    } finally {
      setLoading(false);
    }
  }, [logoutUser]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = async (userData, token) => {
    try {
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(userData);
      await fetchUser(); // Obtener datos actualizados del usuario
    } catch (error) {
      console.error('Error during login:', error);
      logoutUser();
    }
  };

  const idleLogout = () => {
    if (user) {
      toast.warn('Su sesión está a punto de expirar por inactividad. ¿Desea continuar?', {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        onClick: () => {
          toast.dismiss();
        },
      });

      setTimeout(() => {
        if (user) {
          logoutUser();
          toast.info('Su sesión ha expirado por inactividad.', {
            position: "top-center",
            autoClose: 3000,
          });
        }
      }, 5000);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      logout: logoutUser, 
      idleLogout,
      refetchUser: fetchUser 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);