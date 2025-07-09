// src/pages/auth/LogoutPage.jsx
import { useEffect } from 'react';
import { logout } from '@/utils/auth';
import { useNavigate } from 'react-router-dom';

export default function LogoutPage() {
  const navigate = useNavigate();
  
  useEffect(() => {
    logout();
    navigate('/login');
  }, []);
  
  return null;
}