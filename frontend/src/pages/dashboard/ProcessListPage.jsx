import React, { useEffect, useState } from "react";
import { apiRequest } from "@/api/apiRequest"; // ajuste se o caminho for diferente
import { useAuthContext } from "@/contexts/AuthContext";

export default function ProcessListPage() {
  const { token } = useAuthContext();
  const [processos, setProcessos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProcessos() {
      setLoading(true);
      try {
        // Busca todos os processos
        const data = await apiRequest("/api/processos", { token });
        setProcessos(data);
      } catch (err) {
        setProcessos([]);
      }
      setLoading(false);
    }
    fetchProcessos();
  }, [token]);

  return (
    <div>
      <h2>Lista de Processos</h2>
      {loading ? (
        <div>Carregando...</div>
      ) : processos.length === 0 ? (
        <div>Nenhum processo encontrado.</div>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Número</th>
              <th>Descrição</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {processos.map(proc => (
              <tr key={proc.id || proc._id}>
                <td>{proc.id || proc._id}</td>
                <td>{proc.numero_processo || proc.numero || "-"}</td>
                <td>{proc.descricao || "-"}</td>
                <td>{proc.status || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}