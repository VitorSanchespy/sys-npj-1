import React, { useEffect, useState } from "react";
import { apiRequest } from "@/api/apiRequest";
import { useAuthContext } from "@/contexts/AuthContext";

export default function ArquivosPage() {
  const { token } = useAuthContext();
  const [arquivos, setArquivos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchArquivos() {
      setLoading(true);
      try {
        // Busca todos os arquivos do sistema. Altere para endpoint correto se necessário.
        const data = await apiRequest("/api/arquivos", { token });
        setArquivos(data);
      } catch {
        setArquivos([]);
      }
      setLoading(false);
    }
    fetchArquivos();
  }, [token]);

  return (
    <div>
      <h2>Arquivos do Sistema</h2>
      {loading ? (
        <div>Carregando arquivos...</div>
      ) : arquivos.length === 0 ? (
        <div>Nenhum arquivo encontrado.</div>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Processo</th>
              <th>Enviado por</th>
              <th>Data</th>
              <th>Tamanho</th>
              <th>Baixar</th>
            </tr>
          </thead>
          <tbody>
            {arquivos.map(arquivo => (
              <tr key={arquivo.id}>
                <td>{arquivo.nome}</td>
                <td>{arquivo.processo_id}</td>
                <td>{arquivo.usuario_nome || arquivo.usuario_id}</td>
                <td>{arquivo.criado_em ? new Date(arquivo.criado_em).toLocaleString() : "-"}</td>
                <td>{arquivo.tamanho ? `${Math.round(arquivo.tamanho / 1024)} KB` : "-"}</td>
                <td>
                  <a href={arquivo.caminho} target="_blank" rel="noopener noreferrer">
                    Baixar
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}