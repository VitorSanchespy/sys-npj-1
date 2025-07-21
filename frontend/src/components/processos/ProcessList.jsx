import React, { useEffect, useState, useCallback } from "react";
import { processService } from "../../api/services";
import { useAuthContext } from "../../contexts/AuthContext";
import { Link } from "react-router-dom";
import CreateProcessModal from "@/components/processos/ProcessCreateModal";

export default function ProcessList() {
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
        data = await processService.getMyProcesses(token);
      } else if (user?.role === "Professor" || user?.role === "admin" || user?.role === "Admin" || user?.role === "professor") {
        data = await processService.getAllProcesses(token);
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

  if (loading) return <div>Carregando processos...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;
  if (!processos.length) return <div>Nenhum processo encontrado.</div>;

  return (
    <div>
      <h2>Processos</h2>
      <table>
        <thead>
          <tr>
            <th>Número</th>
            <th>Descrição</th>
            <th>Status</th>
            <th>Tipo</th>
            <th>Responsável</th>
            <th>Data de Atribuição</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {processos.map((proc) => (
            <tr key={proc.id}>
              <td>
                <Link to={`/processos/${proc.id}`}>{proc.numero_processo || proc.numero || "-"}</Link>
              </td>
              <td>{proc.descricao || "-"}</td>
              <td>{proc.status || "-"}</td>
              <td>{proc.tipo_processo || "-"}</td>
              <td>{proc.idusuario_responsavel || "-"}</td>
              <td>
                {proc.data_atribuicao
                  ? new Date(proc.data_atribuicao).toLocaleString()
                  : "-"}
              </td>
              <td>
                <Link to={`/processos/${proc.id}`}>Detalhes</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {(user?.role === "admin" || user?.role === "professor") && (
        <Link to="/processos/novo">
          <button>Novo Processo</button>
        </Link>
      )}
    </div>
  );
}