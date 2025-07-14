import React from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "../../components/auth/LoginForm";
import { useAuthContext } from "../../contexts/AuthContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthContext();

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate("/"); // Redireciona para dashboard ou home
    }
  }, [isAuthenticated, navigate]);

  return (
    <div style={{ maxWidth: 400, margin: "auto", paddingTop: 64 }}>
      <LoginForm onSuccess={() => navigate("/")} />
    </div>
  );
}