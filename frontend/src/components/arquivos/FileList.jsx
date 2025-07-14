import React, { useEffect, useState } from "react";
import { apiRequest } from "../../api/apiRequest";
import { useAuthContext } from "../../contexts/AuthContext";

export default function FileList({ processoId }) {
  const { token, user } = useAuthContext();
  const [arquivos, setArquivos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchArquivos() {
      try {
        const data = await apiRequest(`/api/processos/${processoId}/arquivos`, { token });
        setArquivos(data);
      } catch {
        setArquivos([]);
      }
      setLoading(false);
    }
    fetchArquivos();
  }, [processoId, token]);

  const handleDelete = async (fileId) => {
    if (!window.confirm("Deseja realmente excluir este arquivo?")) return;
    try {
      await apiRequest(`/api/arquivos/${fileId}`, { method: "DELETE", token });
      setArquivos(arquivos.filter(f => f.id !== fileId));
    } catch (err) {
      alert(err.message || "Erro ao excluir arquivo.");
    }
  };

  if (loading) return <div>Carregando arquivos...</div>;

  return (
    <div>
      <h4>Arquivos Anexados</h4>
      {arquivos.length === 0 && <div>Nenhum arquivo anexado.</div>}
      <ul>
        {arquivos.map(arquivo => (
          <li key={arquivo.id}>
            <a href={arquivo.url} target="_blank" rel="noopener noreferrer">{arquivo.nome}</a>
            {" "}
            <small>({Math.round(arquivo.tamanho / 1024)} KB)</small>
            {(user.role === "admin" || user.role === "professor") && (
              <button onClick={() => handleDelete(arquivo.id)} style={{ marginLeft: 8 }}>
                Excluir
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}