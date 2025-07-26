
import React, { useEffect, useState } from "react";
import { processUpdatesService, auxTablesService } from "../../api/services";
import { useAuthContext } from "../../contexts/AuthContext";
import UpdateForm from "./UpdateForm";
import { getFileUrl } from '../../utils/fileUrl';
import { FIELD_LABELS, getFieldDisplayValue } from './fieldNameMaps';
import { requestCache } from '../../utils/requestCache';


function formatDescricao(descricao, auxData) {
  // Exemplo: "fase_id: '53' → '59'" ou "materia_assunto_id: '2' → '3'"
  if (!descricao) { return ""; }
  // Regex para encontrar padrões tipo campo: 'id1' → 'id2'
  return descricao.replace(/([a-zA-Z_]+): '?([\d]+)'? *→ *'?([\d]+)'?/g, function(match, field, from, to) {
    const label = FIELD_LABELS[field] || field;
    const fromName = getFieldDisplayValue(field, from, auxData);
    const toName = getFieldDisplayValue(field, to, auxData);
    return `${label}: '${fromName}' → '${toName}'`;
  });
}

export default function UpdateList({ processoId }) {
  const { token, user } = useAuthContext();
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [auxData, setAuxData] = useState({ materias: [], fases: [], diligencias: [], localTramitacoes: [] });

  useEffect(() => {
    async function fetchUpdates() {
      try {
        const data = await processUpdatesService.getProcessUpdates(token, processoId);
        setUpdates(data);
      } catch {
        setUpdates([]);
      }
      setLoading(false);
    }
    fetchUpdates();
  }, [processoId, token, showForm]);

  // Carregar dados auxiliares para mapear ids para nomes (com cache global)
  useEffect(() => {
    let isMounted = true;
    
    async function fetchAux() {
      try {
        // Usando cache global para cada requisição individual
        const [materias, fases, diligencias, localTramitacoes] = await Promise.all([
          requestCache.getOrFetch('aux:materias', () => auxTablesService.getMateriaAssunto(token)),
          requestCache.getOrFetch('aux:fases', () => auxTablesService.getFase(token)),
          requestCache.getOrFetch('aux:diligencias', () => auxTablesService.getDiligencia(token)),
          requestCache.getOrFetch('aux:localTramitacoes', () => auxTablesService.getLocalTramitacao(token)),
        ]);
        
        if (isMounted) {
          setAuxData({ materias, fases, diligencias, localTramitacoes });
        }
      } catch (error) {
        console.error('Erro ao carregar dados auxiliares:', error);
        if (isMounted) {
          setAuxData({ materias: [], fases: [], diligencias: [], localTramitacoes: [] });
        }
      }
    }
    
    fetchAux();
    
    return () => {
      isMounted = false;
    };
  }, [token]);

  if (loading) return <div>Carregando atualizações...</div>;
  return (
    <div>
      {["admin", "professor", "aluno"].includes((user.role?.nome || user.role || "").toLowerCase()) && (
        <button 
          onClick={() => setShowForm(v => !v)}
          style={{
            backgroundColor: showForm ? '#6c757d' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            padding: '10px 16px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          {showForm ? '❌ Fechar' : '➕ Nova Atualização'}
        </button>
      )}
      {showForm && (
        <UpdateForm
          processoId={processoId}
          onSuccess={() => setShowForm(false)}
        />
      )}
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {updates.length === 0 && (
          <li style={{
            padding: '20px',
            textAlign: 'center',
            color: '#6c757d',
            fontStyle: 'italic'
          }}>
            Nenhuma atualização encontrada.
          </li>
        )}
        {updates.map(upd => (
          <li key={upd.id} style={{
            marginBottom: '16px',
            padding: '16px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            border: '1px solid #dee2e6'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
              <div>
                <span style={{
                  display: 'inline-block',
                  backgroundColor: '#007bff',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: '600',
                  marginRight: '8px'
                }}>
                  {upd.tipo_atualizacao || 'Atualização'}
                </span>
                <span style={{ color: '#6c757d', fontSize: '14px' }}>
                  Por: <strong>{upd.usuario?.nome || upd.usuario_nome || 'Usuário'}</strong>
                </span>
              </div>
              <span style={{ color: '#6c757d', fontSize: '12px' }}>
                {new Date(upd.data_atualizacao).toLocaleString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit', 
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
            
            {upd.descricao && (
              <div style={{ marginBottom: '8px', color: '#495057' }}>
                {formatDescricao(upd.descricao, auxData)}
              </div>
            )}
            
            {upd.arquivo && (
              <div style={{
                backgroundColor: '#e9ecef',
                padding: '8px 12px',
                borderRadius: '4px',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{ fontSize: '16px' }}>📎</span>
                <div>
                  <div style={{ fontWeight: '600', color: '#495057' }}>
                    {upd.arquivo.nome || 'Arquivo'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6c757d' }}>
                    Tipo: {upd.arquivo.tipo || 'N/A'} | 
                    Tamanho: {upd.arquivo.tamanho ? `${(upd.arquivo.tamanho / 1024).toFixed(1)} KB` : 'N/A'}
                  </div>
                </div>
                <a 
                  href={getFileUrl(upd.arquivo.caminho || upd.anexo)} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{
                    marginLeft: 'auto',
                    color: '#007bff',
                    textDecoration: 'none',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}
                >
                  📥 Baixar
                </a>
              </div>
            )}

            {user.role && ['professor', 'admin'].includes((user.role?.nome || user.role || "").toLowerCase()) && (
              <button
                style={{ 
                  marginTop: '8px',
                  color: '#fff', 
                  background: '#dc3545', 
                  border: 'none', 
                  borderRadius: '4px', 
                  padding: '4px 12px', 
                  fontSize: '12px',
                  fontWeight: '500', 
                  cursor: 'pointer' 
                }}
                onClick={async () => {
                  if(window.confirm('Tem certeza que deseja excluir esta atualização?')) {
                    await processUpdatesService.deleteProcessUpdate(upd.processo_id, upd.id, token);
                    setUpdates(updates.filter(u => u.id !== upd.id));
                  }
                }}
              >
                🗑️ Excluir
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}