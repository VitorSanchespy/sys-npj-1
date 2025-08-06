import React, { useEffect, useState } from "react";
import { arquivoService } from "../../api/services";
import { useAuthContext } from "../../contexts/AuthContext";
import DocumentUploadForm from "./DocumentUploadForm";

export default function DocumentList({ processoId }) {
  const { token, user } = useAuthContext();
  const [documentos, setDocumentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadForm, setShowUploadForm] = useState(false);

  useEffect(() => {
    async function fetchDocumentos() {
      try {
        let data = await arquivoService.listArquivos(token);
        // Filtrar por processoId se fornecido
        if (processoId) {
          data = data.filter(doc => String(doc.processo_id) === String(processoId));
        }
        setDocumentos(data);
      } catch (error) {
        console.error('Erro ao carregar documentos:', error);
        setDocumentos([]);
      }
      setLoading(false);
    }
    if (token) {
      fetchDocumentos();
    }
  }, [processoId, token, showUploadForm]);

  const handleDownload = async (arquivoId, nomeOriginal) => {
    try {
      const response = await fetch(`http://localhost:3001/api/arquivos/${arquivoId}/download`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Erro no download');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = nomeOriginal || 'documento';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Erro no download:', error);
      alert('Erro ao baixar o arquivo');
    }
  };

  if (loading) return <div>Carregando documentos...</div>;

  return (
    <div>
      {["admin", "professor", "aluno"].includes((user.role || "").toLowerCase()) && (
        <button 
          onClick={() => setShowUploadForm(v => !v)}
          style={{
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer',
            marginBottom: '16px'
          }}
        >
          {showUploadForm ? "Cancelar" : "📎 Adicionar Documento"}
        </button>
      )}
      
      {showUploadForm && (
        <DocumentUploadForm
          processoId={processoId}
          onSuccess={() => setShowUploadForm(false)}
          onCancel={() => setShowUploadForm(false)}
        />
      )}
      
      <div style={{ marginTop: '16px' }}>
        {documentos.length === 0 ? (
          <p style={{ color: '#6c757d', fontStyle: 'italic' }}>
            Nenhum documento anexado ao processo.
          </p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {documentos.map(doc => (
              <li 
                key={doc.id} 
                style={{
                  border: '1px solid #e9ecef',
                  borderRadius: '4px',
                  padding: '12px',
                  marginBottom: '8px',
                  backgroundColor: '#f8f9fa'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <strong style={{ color: '#495057' }}>
                      📄 {doc.nome_original || doc.nome}
                    </strong>
                    <div style={{ fontSize: '12px', color: '#6c757d', marginTop: '4px' }}>
                      Tamanho: {(doc.tamanho / 1024).toFixed(1)} KB | 
                      Tipo: {doc.tipo} | 
                      Enviado por: {doc.usuario?.nome || 'Usuário'} | 
                      Data: {new Date(doc.criado_em).toLocaleString()}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleDownload(doc.id, doc.nome_original || doc.nome)}
                      style={{
                        backgroundColor: '#28a745',
                        color: 'white',
                        border: 'none',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      📥 Baixar
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
