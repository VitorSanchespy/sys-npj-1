
import React, { useEffect, useState, useCallback } from "react";
import { apiRequest } from "@/api/apiRequest";
import { useAuthContext } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";

function ProcessosTable({ processos }) {
  return (
    <table>
      <thead>
        <tr>
          <th>Número</th>
          <th>Descrição</th>
        </tr>
      </thead>
      <tbody>
        {processos.map((processo) => (
          <tr key={processo.id}>
            <td>
              <Link to={`/processos/${processo.id}`}>
                {processo.numero_processo || processo.numero || "-"}
              </Link>
            </td>
            <td>{processo.descricao || "-"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}


export default function ProcessListPage() {
  const { token, user } = useAuthContext();
  const [processos, setProcessos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProcessos = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      let data = [];
      if (user?.role === "Aluno") {
        data = await apiRequest("/api/processos/meus-processos", { token });
      } else if (user?.role === "Professor") {
        data = await apiRequest("/api/processos", { token });
      }
      setProcessos(data);
    } catch (err) {
      setProcessos([]);
      setError("Erro ao carregar processos.");
    }
    setLoading(false);
  }, [token, user]);

  useEffect(() => {
    if (user?.role) fetchProcessos();
  }, [fetchProcessos, user]);

  if (loading) return <div style={{ padding: 24 }}>Carregando processos...</div>;
  if (error) return <div style={{ color: "red", padding: 24 }}>{error}</div>;

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ marginBottom: 16 }}>Processos</h2>
      {processos.length === 0 ? (
        <p>Nenhum processo encontrado.</p>
      ) : (
        <ProcessosTable processos={processos} />
      )}
    </div>
  );
}