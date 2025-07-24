import React, { useEffect, useState } from "react";
import { fileService } from "../../api/services";
import { useAuthContext } from "../../contexts/AuthContext";
import FileUploadForm from "../../components/arquivos/FileUploadForm";
import { getFileUrl } from '../../utils/fileUrl';

export default function ArquivosPage() {
  const { token, user } = useAuthContext();
  const [arquivos, setArquivos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchArquivos() {
      setLoading(true);
      try {
        // Busca apenas arquivos do usuário logado
        const data = await fileService.getUserFiles(token, user.id);
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
      {/* Header fixo */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: '#001F3F',
        padding: '15px 0',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        zIndex: 100
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '15px'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            backgroundColor: 'white',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.2rem',
            fontWeight: 'bold',
            color: '#001F3F'
          }}>
            NPJ
          </div>
          <h1 style={{ color: 'white', margin: 0, fontSize: '1.3rem', fontWeight: 'bold' }}>
            Sistema NPJ - UFMT
          </h1>
        </div>
      </div>

      <div style={{ paddingTop: '100px' }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          backgroundColor: 'white',
          borderRadius: '20px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.1)',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ background: 'linear-gradient(135deg, #001F3F 0%, #004080 100%)', color: 'white', padding: '30px', borderTopLeftRadius: '20px', borderTopRightRadius: '20px' }}>
            <h2 style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)' }}>
              📁 Meus Arquivos
            </h2>
          </div>
          <div style={{ padding: '30px' }}>
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
                    <th>Excluir</th>
                  </tr>
                </thead>
                <tbody>
                  {arquivos.map(arquivo => {
                    const nomeCurto = arquivo.nome && arquivo.nome.length > 30
                      ? arquivo.nome.slice(0, 15) + '...' + arquivo.nome.slice(-10)
                      : arquivo.nome;
                    return (
                      <tr key={arquivo.id}>
                        <td title={arquivo.nome}>{nomeCurto}</td>
                        <td>{arquivo.criado_em ? new Date(arquivo.criado_em).toLocaleString() : "-"}</td>
                        <td>{arquivo.tamanho ? `${Math.round(arquivo.tamanho / 1024)} KB` : "-"}</td>
                        <td>
                          <button onClick={() => window.open(getFileUrl(arquivo.caminho), "_blank")}>Abrir</button>
                        </td>
                        <td>
                          <button
                            style={{ background: '#d32f2f', color: 'white', border: 0, borderRadius: 4, padding: '4px 10px', cursor: 'pointer' }}
                            onClick={async () => {
                              if (window.confirm('Tem certeza que deseja excluir este arquivo?')) {
                                try {
                                  await fileService.deleteFile(arquivo.id, token);
                                  setArquivos(arquivos.filter(a => a.id !== arquivo.id));
                                } catch (err) {
                                  alert('Erro ao excluir arquivo: ' + (err.message || 'Erro desconhecido'));
                                }
                              }
                            }}
                          >Excluir</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        textAlign: 'center',
        padding: '20px',
        color: 'rgba(255,255,255,0.7)',
        fontSize: '0.9rem'
      }}>
        © 2025 Universidade Federal de Mato Grosso - NPJ
      </div>
    </div>
  );
}