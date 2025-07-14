import React, { useEffect, useState } from "react";
import { apiRequest } from "../../api/apiRequest";
import { useAuthContext } from "../../contexts/AuthContext";
import { Link } from "react-router-dom";

export default function ProcessList() {
  const { token, user } = useAuthContext();
  const [processos, setProcessos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProcessos() {
      try {
        const data = await apiRequest("/api/processos", { token });
        setProcessos(data);
      } catch (error) {
        setProcessos([]);
      }
      setLoading(false);
    }
    fetchProcessos();
  }, [token]);

  if (loading) return <div>Carregando processos...</div>;
  if (!processos.length) return <div>Nenhum processo encontrado.</div>;

  return (
    <div>
      <h2>Processos</h2>
      <table>
        <thead>
          <tr>
            <th>Nº</th>
            <th>Nome</th>
            <th>Status</th>
            <th>Aluno</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {processos.map(proc => (
            <tr key={proc.id}>
              <td>{proc.numero}</td>
              <td>{proc.nome}</td>
              <td>{proc.status}</td>
              <td>{proc.aluno_nome || "Não atribuído"}</td>
              <td>
                <Link to={`/processos/${proc.id}`}>Detalhes</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {(user.role === "admin" || user.role === "professor") && (
        <Link to="/processos/novo">
          <button>Novo Processo</button>
        </Link>
      )}
    </div>
  );
}