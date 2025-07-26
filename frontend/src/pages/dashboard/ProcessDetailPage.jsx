import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiRequest } from "@/api/apiRequest";
import { useAuthContext } from "@/contexts/AuthContext";
import Button from "@/components/common/Button";
import StatusBadge from "@/components/common/StatusBadge";
import Loader from "@/components/layout/Loader";
import UpdateList from "@/components/atualizacoes/UpdateList";
import ProcessAssignUserModal from "@/components/processos/ProcessAssignUserModal";
import ProcessUnassignUserModal from "@/components/processos/ProcessUnassignUserModal";
import { getUserRole, hasRole, formatDate, renderValue } from "@/utils/commonUtils";
import { requestCache } from "@/utils/requestCache";

export default function ProcessDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuthContext();
  const [processo, setProcesso] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showUnassignModal, setShowUnassignModal] = useState(false);
  const [alunos, setAlunos] = useState([]);

  useEffect(() => {
    let isMounted = true;

    // Função para buscar os detalhes do processo com cache
    const fetchProcesso = async () => {
      const cacheKey = requestCache.generateKey(`/api/processos/${id}/detalhes`);
      
      try {
        const response = await requestCache.getOrFetch(cacheKey, () =>
          apiRequest(`/api/processos/${id}/detalhes`, { method: "GET", token })
        );
        
        if (isMounted) {
          setProcesso(response);
        }
      } catch (error) {
        console.error("Erro ao buscar processo:", error);
        if (isMounted) {
          setProcesso(null);
        }
      }
    };

    // Função para buscar todos os usuários vinculados ao processo com cache
    const fetchAlunos = async () => {
      const cacheKey = requestCache.generateKey(`/api/processos/${id}/usuarios`);
      
      try {
        const response = await requestCache.getOrFetch(cacheKey, () =>
          apiRequest(`/api/processos/${id}/usuarios`, { method: "GET", token })
        );
        
        if (isMounted) {
          setAlunos(response);
        }
      } catch (error) {
        console.error("Erro ao buscar usuários vinculados:", error);
        if (isMounted) {
          setAlunos([]);
        }
      }
    };

    const loadData = async () => {
      if (token && id) {
        setLoading(true);
        await Promise.all([fetchProcesso(), fetchAlunos()]);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [id, token]);

  // Funções para vinculação/desvinculação
  const handleAssignUser = async (userId) => {
    // O modal já fez a vinculação, só precisamos recarregar os dados
    try {
      // Limpa cache e recarrega dados
      requestCache.clear(`GET:/api/processos/${id}/usuarios:`);
      const response = await apiRequest(`/api/processos/${id}/usuarios`, { method: "GET", token });
      setAlunos(response);
      setShowAssignModal(false);
    } catch (error) {
      console.error("Erro ao recarregar usuários:", error);
      // Recarrega a página como fallback se falhar
      window.location.reload();
    }
  };

  const handleUnassignUser = async (userId) => {
    // O modal já fez a desvinculação, só precisamos atualizar a lista local
    try {
      // Limpa cache e atualiza lista local
      requestCache.clear(`GET:/api/processos/${id}/usuarios:`);
      if (userId) {
        setAlunos(alunos.filter(aluno => aluno.id !== userId));
      } else {
        // Se não temos o userId, recarrega a lista
        const response = await apiRequest(`/api/processos/${id}/usuarios`, { method: "GET", token });
        setAlunos(response);
      }
      setShowUnassignModal(false);
    } catch (error) {
      console.error("Erro ao atualizar lista:", error);
    }
  };

  if (loading) {
    return <Loader message="Carregando processo..." />;
  }

  if (!processo) {
    return <Loader error="Processo não encontrado" />;
  }

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '8px',
      padding: '24px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      border: '1px solid #e9ecef',
      marginBottom: '24px'
    }}>
      <h1 style={{
        margin: 0,
        fontSize: '24px',
        fontWeight: '600',
        color: '#212529'
      }}>
        Processo Nº {processo.numero_processo || processo.numero}
      </h1>
      <p style={{
        margin: '8px 0 0 0',
        fontSize: '14px',
        color: '#6c757d'
      }}>
        Detalhes completos do processo
      </p>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', margin: '20px 0' }}>
        <Button
          variant="outline"
          onClick={() => navigate('/processos')}
        >
          ← Voltar à Lista
        </Button>
        {hasRole(user, ['Administrador', 'Professor']) && (
          <Button
            variant="primary"
            onClick={() => navigate(`/processos/${id}/editar`)}
          >
            ✏️ Editar
          </Button>
        )}
      </div>

        {/* Informações Básicas */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px',
          marginBottom: '24px'
        }}>
          <div style={{
            backgroundColor: '#f8f9fa',
            padding: '20px',
            borderRadius: '8px',
            border: '1px solid #e9ecef'
          }}>
            <h3 style={{
              margin: '0 0 16px 0',
              fontSize: '16px',
              fontWeight: '600',
              color: '#495057'
            }}>
              📊 Status e Informações
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <strong>Status:</strong>
                <div style={{ marginTop: '4px' }}>
                  <StatusBadge status={processo.status} />
                </div>
              </div>
              <div>
                <strong>Descrição:</strong>
                <p style={{ margin: '4px 0 0 0', color: '#6c757d' }}>
                  {renderValue(processo.descricao)}
                </p>
              </div>
              <div>
                <strong>Data de Criação:</strong>
                <p style={{ margin: '4px 0 0 0', color: '#6c757d' }}>
                  {formatDate(processo.created_at)}
                </p>
              </div>
              <div>
                <strong>Última Atualização:</strong>
                <p style={{ margin: '4px 0 0 0', color: '#6c757d' }}>
                  {formatDate(processo.updated_at)}
                </p>
              </div>
            </div>
          </div>

          <div style={{
            backgroundColor: '#f8f9fa',
            padding: '20px',
            borderRadius: '8px',
            border: '1px solid #e9ecef'
          }}>
            <h3 style={{
              margin: '0 0 16px 0',
              fontSize: '16px',
              fontWeight: '600',
              color: '#495057'
            }}>
              👤 Assistido
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <strong>Nome:</strong>
                <p style={{ margin: '4px 0 0 0', color: '#6c757d' }}>
                  {renderValue(processo.assistido)}
                </p>
              </div>
              <div>
                <strong>Contato:</strong>
                <p style={{ margin: '4px 0 0 0', color: '#6c757d' }}>
                  {renderValue(processo.contato_assistido)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Usuários Vinculados */}
        <div style={{
          backgroundColor: '#f8f9fa',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #e9ecef',
          marginBottom: '24px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px'
          }}>
            <h3 style={{
              margin: 0,
              fontSize: '16px',
              fontWeight: '600',
              color: '#495057'
            }}>
              👥 Usuários Vinculados
            </h3>
            {hasRole(user, ['Administrador', 'Professor']) && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowAssignModal(true)}
              >
                + Vincular Usuário
              </Button>
            )}
          </div>

          {alunos && alunos.length > 0 ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
              gap: '12px'
            }}>
              {alunos.map((aluno, index) => (
                <div key={aluno.id || aluno.email || index} style={{
                  backgroundColor: 'white',
                  padding: '12px',
                  borderRadius: '6px',
                  border: '1px solid #dee2e6',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <p style={{ margin: 0, fontWeight: '500' }}>{aluno.nome}</p>
                    <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#6c757d' }}>
                      {aluno.email} - {aluno.role}
                    </p>
                    {aluno.telefone && (
                      <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#6c757d' }}>
                        📞 {aluno.telefone}
                      </p>
                    )}
                  </div>
                  {hasRole(user, ['Administrador', 'Professor']) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUnassignUser(aluno.id)}
                    >
                      ✖
                    </Button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '20px',
              color: '#6c757d'
            }}>
              <p>Nenhum usuário vinculado a este processo.</p>
              {hasRole(user, ['Administrador', 'Professor']) && (
                <p style={{ fontSize: '14px', marginTop: '8px' }}>
                  Clique em "Vincular Usuário" para adicionar alunos ou professores.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Lista de Atualizações */}
        <div style={{
          backgroundColor: '#f8f9fa',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #e9ecef'
        }}>
          <h3 style={{
            margin: '0 0 16px 0',
            fontSize: '16px',
            fontWeight: '600',
            color: '#495057'
          }}>
            📝 Atualizações do Processo
          </h3>
          <UpdateList processoId={id} />
        </div>

        {/* Modais */}
        {showAssignModal && (
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowAssignModal(false);
              }
            }}
          >
            <ProcessAssignUserModal
              processoId={id}
              onClose={() => setShowAssignModal(false)}
              onAssigned={handleAssignUser}
            />
          </div>
        )}

        {showUnassignModal && (
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowUnassignModal(false);
              }
            }}
          >
            <ProcessUnassignUserModal
              processoId={id}
              alunos={alunos}
              onClose={() => setShowUnassignModal(false)}
              onUnassigned={handleUnassignUser}
            />
          </div>
        )}

      </div>
  );
}

