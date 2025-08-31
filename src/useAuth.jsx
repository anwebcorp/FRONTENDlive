import { useContext } from 'react';
import { AuthContext } from './AuthContextInstance.js';

const getStoredItem = (key) => {
  try {
    return localStorage.getItem(key) || sessionStorage.getItem(key);
  } catch (error) {
    return sessionStorage.getItem(key);
  }
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default useAuth;