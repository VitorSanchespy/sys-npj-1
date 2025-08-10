import React, { useEffect, useState } from "react";
import { processService } from "@/api/services";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { apiRequest } from "@/api/apiRequest";
import { useAuthContext } from "@/contexts/AuthContext";
import Button from "@/components/common/Button";
import StatusBadge from "@/components/common/StatusBadge";
import Loader from "@/components/common/Loader";
import UpdateList from "@/components/atualizacoes/UpdateList";
import DocumentList from "@/components/documentos/DocumentList";
import ProcessAssignUserModal from "@/components/processos/ProcessAssignUserModal";
import ProcessUnassignUserModal from "@/components/processos/ProcessUnassignUserModal";
import { getUserRole, hasRole, formatDate, renderValue } from "@/utils/commonUtils";
import { requestCache } from "@/utils/requestCache";
import { useQueryClient } from '@tanstack/react-query';

export default function ProcessDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token } = useAuthContext();
  const queryClient = useQueryClient();
  const [processo, setProcesso] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showUnassignModal, setShowUnassignModal] = useState(false);
  const [alunos, setAlunos] = useState([]);

  useEffect(() => {
    let isMounted = true;

    // Função para buscar os detalhes do processo com cache
    const fetchProcesso = async () => {
      const currentToken = token || localStorage.getItem('token');
      const cacheKey = requestCache.generateKey(`/api/processos/${id}/detalhes`);
      try {
        // Se veio de uma edição (location.state.updated), limpa o cache primeiro
        if (location.state?.updated) {
          requestCache.clear(cacheKey);
        }
        
        const response = await requestCache.getOrFetch(cacheKey, () =>
          apiRequest(`/api/processos/${id}/detalhes`, { method: "GET", token: currentToken })
        );
        if (isMounted) {
          setProcesso(response);
        }
      } catch (error) {
        if (isMounted) {
          setProcesso(null);
        }
      }
    };

    // Função para buscar todos os usuários vinculados ao processo com cache
    const fetchAlunos = async () => {
      const currentToken = token || localStorage.getItem('token');
      const cacheKey = requestCache.generateKey(`/api/processos/${id}/usuarios`);
      try {
        // Se veio de uma edição (location.state.updated), limpa o cache primeiro
        if (location.state?.updated) {
          requestCache.clear(cacheKey);
        }
        
        const response = await requestCache.getOrFetch(cacheKey, () =>
          apiRequest(`/api/processos/${id}/usuarios`, { method: "GET", token: currentToken })
        );
        if (isMounted) {
          setAlunos(response);
        }
      } catch (error) {
        if (isMounted) {
          setAlunos([]);
        }
      }
    };

    const loadData = async () => {
      const currentToken = token || localStorage.getItem('token');
      if (currentToken && id) {
        setLoading(true);
        
        // Se veio de uma edição, limpa todo o cache relacionado ao processo
        if (location.state?.updated) {
          requestCache.clear(`GET:/api/processos/${id}/detalhes:`);
          requestCache.clear(`GET:/api/processos/${id}/usuarios:`);
          requestCache.clear(`GET:/api/processos:`);
        }
        
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
  }, [id, token, location.state]);

  // Funções para vinculação/desvinculação
  const handleAssignUser = async () => {
    // Recarregar dados após vinculação
    try {
      setLoading(true);
      requestCache.clear(`GET:/api/processos/${id}/usuarios:`);
      const response = await apiRequest(`/api/processos/${id}/usuarios`, { method: "GET", token });
      setAlunos(response);
      setShowAssignModal(false);
    } catch (error) {
      console.error("Erro ao recarregar usuários:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnassignUser = async (userId) => {
    try {
      setLoading(true);
      // Chama o backend para desvincular
      await processService.removeUserFromProcess(token, id, userId);
      // Limpa cache e recarrega lista
      requestCache.clear(`GET:/api/processos/${id}/usuarios:`);
      const response = await apiRequest(`/api/processos/${id}/usuarios`, { method: "GET", token });
      setAlunos(response);
    } catch (error) {
      console.error("Erro ao desvincular usuário:", error);
    } finally {
      setLoading(false);
    }
  };

  // Funções para concluir/reabrir processo
  const handleConcluirProcesso = async () => {
    if (!window.confirm('Tem certeza que deseja concluir este processo?')) {
      return;
    }

    try {
      setLoading(true);
      await processService.concludeProcess(token, id);
      // Limpar cache e recarregar processo
      requestCache.clear(`GET:/api/processos/${id}/detalhes:`);
      queryClient.invalidateQueries(['processos']);
      
      // Recarregar dados do processo
      const response = await apiRequest(`/api/processos/${id}/detalhes`, { method: "GET", token });
      setProcesso(response);
      alert('Processo concluído com sucesso!');
    } catch (error) {
      console.error('Erro ao concluir processo:', error);
      alert('Erro ao concluir processo: ' + (error.message || 'Erro desconhecido'));
    } finally {
      setLoading(false);
    }
  };

  const handleReabrirProcesso = async () => {
    if (!window.confirm('Tem certeza que deseja reabrir este processo?')) {
      return;
    }

    try {
      setLoading(true);
      await processService.reopenProcess(token, id);
      // Limpar cache e recarregar processo
      requestCache.clear(`GET:/api/processos/${id}/detalhes:`);
      queryClient.invalidateQueries(['processos']);
      
      // Recarregar dados do processo
      const response = await apiRequest(`/api/processos/${id}/detalhes`, { method: "GET", token });
      setProcesso(response);
      alert('Processo reaberto com sucesso!');
    } catch (error) {
      console.error('Erro ao reabrir processo:', error);
      alert('Erro ao reabrir processo: ' + (error.message || 'Erro desconhecido'));
    } finally {
      setLoading(false);
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
          Voltar à Lista
        </Button>
        <Button
          variant="primary"
          onClick={() => navigate(`/processos/${id}/editar`)}
        >
          Editar
        </Button>
        {processo.status !== 'Concluído' && (
          <Button
            variant="blueWhite"
            onClick={handleConcluirProcesso}
          >
            Concluir Processo
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
                <strong>Sistema:</strong>
                <p style={{ margin: '4px 0 0 0', color: '#6c757d' }}>
                  {renderValue(processo.sistema)}
                </p>
              </div>
              <div>
                <strong>Tipo:</strong>
                <p style={{ margin: '4px 0 0 0', color: '#6c757d' }}>
                  {renderValue(processo.tipo_processo)}
                </p>
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
                  {formatDate(processo.criado_em)}
                </p>
              </div>
              {processo.atualizado_em && (
                <div>
                  <strong>Última Atualização:</strong>
                  <p style={{ margin: '4px 0 0 0', color: '#6c757d' }}>
                    {formatDate(processo.atualizado_em)}
                  </p>
                </div>
              )}
              {processo.data_encerramento && (
                <div>
                  <strong>Data de Encerramento:</strong>
                  <p style={{ margin: '4px 0 0 0', color: '#6c757d' }}>
                    {formatDate(processo.data_encerramento)}
                  </p>
                </div>
              )}
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
              <div>
                <strong>Processo SEI:</strong>
                <p style={{ margin: '4px 0 0 0', color: '#6c757d' }}>
                  {renderValue(processo.num_processo_sei)}
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
              📋 Classificação
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <strong>Matéria/Assunto:</strong>
                <p style={{ margin: '4px 0 0 0', color: '#6c757d' }}>
                  {processo.materiaAssunto?.nome || 'Não definido'}
                </p>
              </div>
              <div>
                <strong>Fase:</strong>
                <p style={{ margin: '4px 0 0 0', color: '#6c757d' }}>
                  {processo.fase?.nome || 'Não definido'}
                </p>
              </div>
              <div>
                <strong>Diligência:</strong>
                <p style={{ margin: '4px 0 0 0', color: '#6c757d' }}>
                  {processo.diligencia?.nome || 'Não definido'}
                </p>
              </div>
              <div>
                <strong>Local de Tramitação:</strong>
                <p style={{ margin: '4px 0 0 0', color: '#6c757d' }}>
                  {processo.localTramitacao?.nome || 'Não definido'}
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
              👨‍💼 Responsável
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <strong>Nome:</strong>
                <p style={{ margin: '4px 0 0 0', color: '#6c757d' }}>
                  {processo.responsavelVinculado?.nome || processo.responsavel?.nome || 'Não atribuído'}
                </p>
              </div>
              <div>
                <strong>Email:</strong>
                <p style={{ margin: '4px 0 0 0', color: '#6c757d' }}>
                  {processo.responsavelVinculado?.email || processo.responsavel?.email || 'Não informado'}
                </p>
              </div>
              <div>
                <strong>Telefone:</strong>
                <p style={{ margin: '4px 0 0 0', color: '#6c757d' }}>
                  {processo.responsavelVinculado?.telefone || processo.responsavel?.telefone || 'Não informado'}
                </p>
              </div>
              {processo.observacoes && (
                <div>
                  <strong>Observações:</strong>
                  <p style={{ margin: '4px 0 0 0', color: '#6c757d' }}>
                    {processo.observacoes}
                  </p>
                </div>
              )}
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
              Usuários Vinculados
            </h3>
            {hasRole(user, ['Admin', 'Professor']) && (
              <Button
                variant="primary"
                onClick={() => setShowAssignModal(true)}
              >
                Vincular Usuário
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
                  {hasRole(user, ['Admin', 'Professor']) && (
                    <Button
                      variant="danger"
                      onClick={() => handleUnassignUser(aluno.id)}
                    >
                      Remover
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
              {hasRole(user, ['Admin', 'Professor']) && (
                <p style={{ fontSize: '14px', marginTop: '8px' }}>
                  Clique em "Vincular Usuário" para adicionar alunos ou professores.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Seção de Documentos e Anexos */}
        <div style={{
          backgroundColor: '#f8f9fa',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #e9ecef',
          marginBottom: '20px'
        }}>
          <h3 style={{
            margin: '0 0 16px 0',
            fontSize: '16px',
            fontWeight: '600',
            color: '#495057'
          }}>
            📎 Documentos e Anexos
          </h3>
          <p style={{ fontSize: '14px', color: '#6c757d', marginBottom: '16px' }}>
            Anexe documentos relacionados ao processo como despachos, atas, petições, etc.
          </p>
          <DocumentList processoId={id} showInactive={true} />
        </div>

        {/* Histórico de Atualizações do Processo */}
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
            📝 Histórico de Alterações
          </h3>
          <p style={{ fontSize: '14px', color: '#6c757d', marginBottom: '16px' }}>
            Registro de todas as alterações feitas nos dados do processo.
          </p>
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