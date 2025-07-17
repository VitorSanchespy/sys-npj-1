import React, { useEffect, useState } from "react";
import { apiRequest } from "@/api/apiRequest";
import { useAuthContext } from "@/contexts/AuthContext";
import FileUploadForm from "@/components/arquivos/FileUploadForm";
import { getFileUrl } from '@/utils/fileUrl';

export default function ArquivosPage() {
  const { token, user } = useAuthContext();
  const [arquivos, setArquivos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchArquivos() {
      setLoading(true);
      try {
        // Busca apenas arquivos do usuário logado
        const data = await apiRequest(`/api/arquivos/usuario/${user.id}`, { token });
        setArquivos(data);
      } catch {
        setArquivos([]);
      }
      setLoading(false);
    }
    if (user?.id) fetchArquivos();
  }, [token, user]);

  return (
    <div>
      <h2>Meus Arquivos</h2>
      <FileUploadForm onUpload={() => window.location.reload()} />
      {loading ? (
        <div>Carregando arquivos...</div>
      ) : arquivos.length === 0 ? (
        <div>Nenhum arquivo encontrado.</div>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Data</th>
              <th>Tamanho</th>
              <th>Abrir</th>
            </tr>
          </thead>
          <tbody>
            {arquivos.map(arquivo => (
              <tr key={arquivo.id}>
                <td>{arquivo.nome}</td>
                <td>{arquivo.criado_em ? new Date(arquivo.criado_em).toLocaleString() : "-"}</td>
                <td>{arquivo.tamanho ? `${Math.round(arquivo.tamanho / 1024)} KB` : "-"}</td>
                <td>
                  <button onClick={() => window.open(getFileUrl(arquivo.caminho), "_blank")}>Abrir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}