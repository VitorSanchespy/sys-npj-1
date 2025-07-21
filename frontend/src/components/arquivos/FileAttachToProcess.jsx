import React, { useEffect, useState } from "react";
import { fileService } from "../../api/services";
import { useAuthContext } from "../../contexts/AuthContext";
import { getFileUrl } from '../../utils/fileUrl';

export default function FileAttachToProcess({ processoId, onAttach }) {
  const { token, user } = useAuthContext();
  const [arquivos, setArquivos] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(true);
  const [attaching, setAttaching] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchUserFiles() {
      setLoading(true);
      setError("");
      try {
        // Busca arquivos enviados pelo usuário logado
        const data = await fileService.getFilesByUser(user.id, token);
        setArquivos(data);
      } catch (err) {
        setArquivos([]);
        setError("Erro ao buscar arquivos do usuário.");
      }
      setLoading(false);
    }
    if (user?.id) fetchUserFiles();
  }, [token, user]);

  const handleAttach = async (e) => {
    e.preventDefault();
    if (!selectedId) return;
    setAttaching(true);
    setError("");
    try {
      await fileService.attachFileToProcess(processoId, selectedId, token);
      if (onAttach) onAttach();
      setSelectedId("");
    } catch (err) {
      setError(err.message || "Erro ao anexar arquivo.");
    }
    setAttaching(false);
  };

  if (loading) return <div>Carregando arquivos do usuário...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  return (
    <form onSubmit={handleAttach} style={{ marginBottom: 16 }}>
      <label>
        Selecione um arquivo já enviado:
        <select value={selectedId} onChange={e => setSelectedId(e.target.value)} required style={{ marginLeft: 8 }}>
          <option value="">-- Escolha um arquivo --</option>
          {arquivos.map(arq => (
            <option key={arq.id} value={arq.id}>
              {arq.nome} - 
              <a href={getFileUrl(arq.caminho)} target="_blank" rel="noopener noreferrer" style={{marginLeft:4}}>ver</a>
            </option>
          ))}
        </select>
      </label>
      <button type="submit" disabled={attaching || !selectedId} style={{ marginLeft: 8 }}>
        {attaching ? "Anexando..." : "Anexar ao Processo"}
      </button>
    </form>
  );
}
