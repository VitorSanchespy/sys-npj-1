import React, { createContext, useState, useEffect, useContext } from "react";
import { apiRequest } from "../api/apiRequest";
import Loader from "../components/common/Loader"; 

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const local = localStorage.getItem("user");
    return local ? JSON.parse(local) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");
  const [loading, setLoading] = useState(false);

  // Persistência simples
  useEffect(() => {
    if (user && token) {
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    }
  }, [user, token]);

  const login = async (email, senha) => {
    setLoading(true);
    try {
      const data = await apiRequest("/auth/login", {
        method: "POST",
        body: { email, senha },
      });
      setUser(data.usuario);
      setToken(data.token);
      setLoading(false);
      return { success: true };
    } catch (err) {
      setLoading(false);
      return { success: false, message: err.message || "Erro ao fazer login" };
    }
  };

  const logout = () => {
    setUser(null);
    setToken("");
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };
if (loading) return <Loader text="Verificando autenticação..." />;
  // ...restante do código igual
  return (
    <AuthContext.Provider value={{ user, setUser, token, login, logout, loading, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  return useContext(AuthContext);
}