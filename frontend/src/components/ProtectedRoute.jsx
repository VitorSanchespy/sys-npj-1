import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated, getCurrentUser } from '@/utils/auth';

const ProtectedRoute = ({ 
  children, 
  roles = [], 
  redirectTo = '/login',
  fallbackRedirect = '/dashboard'
}) => {
  const location = useLocation();
  const isAuth = isAuthenticated();
  const user = getCurrentUser();

  if (!isAuth) {
    return (
      <Navigate 
        to={redirectTo} 
        replace 
        state={{ from: location }} 
      />
    );
  }

  if (roles.length > 0 && (!user?.role || !roles.includes(user.role))) {
    return <Navigate to={fallbackRedirect} replace />;
  }

  return children;
};

export default ProtectedRoute;