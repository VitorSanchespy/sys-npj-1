import { useEffect, useState } from "react";
import api from "@/api/apiService";

export function useAuth() {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPerfil() {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get("/auth/perfil");
        setUsuario(res.data);
      } catch {
        localStorage.removeItem("token");
        setUsuario(null);
      }
      setLoading(false);
    }
    fetchPerfil();
  }, []);

  return { usuario, loading };
}