import { useAuth } from "../hooks/useAuth";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const { usuario, loading } = useAuth();
  if (loading) return <div>Carregando...</div>;
  if (!usuario) return <Navigate to="/login" />;
  return children;
}