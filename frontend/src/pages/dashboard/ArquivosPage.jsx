import React, { useEffect, useState } from "react";
import { arquivoService } from "../../api/services";
import { useAuthContext } from "../../contexts/AuthContext";
import FileUploadForm from "../../components/arquivos/FileUploadForm";
import { getFileUrl } from '../../utils/fileUrl';
import Button from "@/components/common/Button";
import { useArquivoAutoRefresh } from "../../hooks/useAutoRefresh";

export default function ArquivosPage() {
  const { token, user } = useAuthContext();
  const [arquivos, setArquivos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Implementar auto-refresh para arquivos
  const { afterUploadArquivo, afterDeleteArquivo, refreshArquivos } = useArquivoAutoRefresh(30000);

  const fetchArquivos = async () => {
    setLoading(true);
    try {
      // Backend agora filtra automaticamente por usuário para alunos
      const data = await arquivoService.listArquivos(token);
      setArquivos(data);
    } catch {
      setArquivos([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user?.id) {
      fetchArquivos();
    }
  }, [token, user]);

  // Função para ser chamada após upload
  const handleAfterUpload = () => {
    afterUploadArquivo();
    fetchArquivos(); // Refresh manual imediato
  };

  // Função para ser chamada após deletar
  const handleAfterDelete = () => {
    afterDeleteArquivo();
    fetchArquivos(); // Refresh manual imediato
  };

  return (
    <>
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ 
          margin: 0, 
          fontSize: '24px', 
          fontWeight: '600',
          color: '#343a40'
        }}>
          📁 Meus Arquivos
        </h1>
        <p style={{ 
          margin: '8px 0 0 0', 
          fontSize: '14px', 
          color: '#6c757d' 
        }}>
          Gerencie seus arquivos e documentos
        </p>
      </div>
      
      <FileUploadForm onUpload={handleAfterUpload} />
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
                <th>Excluir</th>
              </tr>
            </thead>
            <tbody>
              {arquivos.map(arquivo => {
                const nomeArquivo = typeof arquivo.nome === 'object' ? arquivo.nome?.nome || JSON.stringify(arquivo.nome) : arquivo.nome;
                const nomeCurto = nomeArquivo && nomeArquivo.length > 30
                  ? nomeArquivo.slice(0, 15) + '...' + nomeArquivo.slice(-10)
                  : nomeArquivo;
                return (
                  <tr key={arquivo.id}>
                    <td title={nomeArquivo}>{nomeCurto}</td>
                    <td>{arquivo.criado_em ? new Date(arquivo.criado_em).toLocaleString() : "-"}</td>
                    <td>{arquivo.tamanho ? `${Math.round(arquivo.tamanho / 1024)} KB` : "-"}</td>
                    <td>
                      <Button 
                        variant="link" 
                        onClick={() => window.open(getFileUrl(arquivo.caminho), "_blank")}
                      >
                        Abrir
                      </Button>
                    </td>
                    <td>
                      <Button
                        variant="danger"
                        onClick={async () => {
                          if (window.confirm('Tem certeza que deseja excluir este arquivo?')) {
                            try {
                              await arquivoService.deleteArquivo(token, arquivo.id);
                              setArquivos(arquivos.filter(a => a.id !== arquivo.id));
                              handleAfterDelete(); // Trigger auto-refresh
                            } catch (err) {
                              alert('Erro ao excluir arquivo: ' + (err.message || 'Erro desconhecido'));
                            }
                          }
                        }}
                      >Excluir</Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
    </>
  );
}