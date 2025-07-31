import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api, apiRequest } from "@/api/apiRequest";
import { useAuthContext } from "@/contexts/AuthContext";
import Button from "@/components/common/Button";
import StatusBadge from "@/components/common/StatusBadge";
import Loader from "@/components/layout/Loader";
import UpdateList from "@/components/atualizacoes/UpdateList";
import { getUserRole, hasRole, formatDate, renderValue } from "@/utils/commonUtils";

export default function ProcessDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [processo, setProcesso] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showUnassignModal, setShowUnassignModal] = useState(false);
  const [alunos, setAlunos] = useState([]);

  // Se não houver usuário autenticado, redirecionar para login
  useEffect(() => {
    if (!user || !user.token) {
      navigate('/login', { 
        replace: true,
        state: { from: `/processos/${id}` }
      });
    }
  }, [user, id, navigate]);

  useEffect(() => {
    if (!user?.token || !id) {
      setLoading(false);
      return;
    }

    let mounted = true;
    
    const fetchData = async () => {
      setLoading(true);
      try {
        console.log('Buscando processo:', id);
        console.log('Token:', user.token ? 'Presente' : 'Ausente');
        console.log('Headers:', {
          'Authorization': `Bearer ${user.token}`
        });
        
        // Fazer as duas chamadas em paralelo com headers explícitos
        const [processoResponse, alunosResponse] = await Promise.all([
          api.get(`/processos/${id}`, {
            headers: {
              'Authorization': `Bearer ${user.token}`
            }
          }),
          api.get(`/processos/${id}/usuarios`, {
            headers: {
              'Authorization': `Bearer ${user.token}`
            }
          })
        ]);

        if (!mounted) return;

        if (!processoResponse.data) {
          console.log('Resposta vazia do processo');
          setError('Processo não encontrado');
          return;
        }

        console.log('Processo encontrado:', processoResponse.data);
        setProcesso(processoResponse.data);
        setAlunos(alunosResponse.data);
        setError(null);
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
        if (error.response?.status === 403) {
          setError('Você não tem permissão para acessar este processo');
          setTimeout(() => navigate('/dashboard', { replace: true }), 2000);
        } else if (error.response?.status === 404) {
          setError('Processo não encontrado');
        } else {
          setError(error.response?.data?.erro || 'Erro ao carregar o processo');
        }
        setProcesso(null);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, [id, user?.token]);

  // Funções para vinculação/desvinculação (será implementado conforme necessário)
  const handleAssignUser = async (userId) => {
    // Implementar lógica de vinculação
    console.log("Vinculando usuário:", userId);
  };

  const handleUnassignUser = async (userId) => {
    // Implementar lógica de desvinculação  
    console.log("Desvinculando usuário:", userId);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader size={40} text="Carregando detalhes do processo..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-4 bg-white rounded-lg shadow">
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-600 mb-2">Erro ao carregar processo</h2>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Voltar para Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!processo) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-4 bg-white rounded-lg shadow">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-800 mb-2">Processo não encontrado</h2>
          <p className="text-gray-600 mb-4">O processo que você está procurando não existe ou foi removido.</p>
          {import.meta.env.DEV && (
            <div className="text-left p-4 bg-gray-100 rounded mb-4 text-sm">
              <p className="font-bold mb-2">Informações de Debug:</p>
              <p>ID do Processo: {id}</p>
              <p>Token válido: {user?.token ? 'Sim' : 'Não'}</p>
              <p>Role do usuário: {user?.role}</p>
              <p>Erro: {error}</p>
            </div>
          )}
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Voltar para Dashboard
          </button>
        </div>
      </div>
    );
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
        {hasRole(user, ['Admin', 'Professor']) && (
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
        {alunos && alunos.length > 0 && (
          <div style={{
            backgroundColor: '#f8f9fa',
            padding: '20px',
            borderRadius: '8px',
            border: '1px solid #e9ecef',
            marginBottom: '24px'
          }}>
            <h3 style={{
              margin: '0 0 16px 0',
              fontSize: '16px',
              fontWeight: '600',
              color: '#495057'
            }}>
              👥 Usuários Vinculados
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
              gap: '12px'
            }}>
              {alunos.map((aluno) => (
                <div key={aluno.id} style={{
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
                      {aluno.email}
                    </p>
                  </div>
                  {hasRole(user, ['Admin', 'Professor']) && (
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
          </div>
        )}

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

      </div>
  );
}

