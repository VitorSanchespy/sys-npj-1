import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthContext';
import { apiRequest } from '@/api/apiRequest';
import Button from '@/components/common/Button';
import Loader from '@/components/common/Loader';
import { formatDateTime } from '@/utils/commonUtils';

const ConviteAgendamento = () => {
  const { id, acao } = useParams(); // acao pode ser 'aceitar' ou 'recusar'
  const navigate = useNavigate();
  const { token, user } = useAuthContext();
  const [agendamento, setAgendamento] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    carregarAgendamento();
  }, [id]);

  const carregarAgendamento = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await apiRequest(`/api/agendamentos/${id}`, {
        method: 'GET',
        token
      });

      if (response.success) {
        setAgendamento(response.data);
        
        // Verificar se o usuário está na lista de convidados
        const convidados = response.data.convidados || [];
        const userConvidado = convidados.find(c => c.email === user?.email);
        
        if (!userConvidado) {
          setError('Você não foi convidado para este agendamento ou o convite não foi encontrado.');
        } else if (userConvidado.status !== 'pendente') {
          setError(`Você já ${userConvidado.status === 'aceito' ? 'aceitou' : 'recusou'} este convite anteriormente.`);
        }
      } else {
        throw new Error(response.message || 'Erro ao carregar agendamento');
      }
    } catch (error) {
      console.error('Erro ao carregar agendamento:', error);
      setError(error.message || 'Erro interno do servidor');
    } finally {
      setLoading(false);
    }
  };

  const processarResposta = async (acaoEscolhida) => {
    try {
      setProcessing(true);
      setError('');

      const endpoint = `/api/agendamentos/${id}/${acaoEscolhida}`;
      const response = await apiRequest(endpoint, {
        method: 'POST',
        data: { email: user?.email },
        token
      });

      if (response.success) {
        setSuccess(true);
        setAgendamento(response.data);
      } else {
        throw new Error(response.message || 'Erro ao processar resposta');
      }
    } catch (error) {
      console.error('Erro ao processar resposta:', error);
      setError(error.message || 'Erro interno do servidor');
    } finally {
      setProcessing(false);
    }
  };

  const getTipoIcon = (tipo) => {
    switch (tipo) {
      case 'reuniao': return '👥';
      case 'audiencia': return '⚖️';
      case 'prazo': return '⏰';
      default: return '📅';
    }
  };

  const getTipoText = (tipo) => {
    switch (tipo) {
      case 'reuniao': return 'Reunião';
      case 'audiencia': return 'Audiência';
      case 'prazo': return 'Prazo';
      default: return 'Outro';
    }
  };

  if (loading) {
    return <Loader message="Carregando convite..." />;
  }

  if (success) {
    return (
      <div style={{
        maxWidth: '600px',
        margin: '40px auto',
        padding: '24px',
        backgroundColor: 'white',
        borderRadius: '8px',
        border: '1px solid #e9ecef',
        textAlign: 'center'
      }}>
        <div style={{
          backgroundColor: '#d4edda',
          color: '#155724',
          padding: '16px',
          borderRadius: '6px',
          marginBottom: '20px',
          border: '1px solid #c3e6cb'
        }}>
          <h2 style={{ margin: '0 0 8px 0' }}>
            ✅ Resposta registrada com sucesso!
          </h2>
          <p style={{ margin: 0 }}>
            Sua resposta ao convite foi registrada.
          </p>
        </div>

        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'center'
        }}>
          <Button
            variant="primary"
            onClick={() => navigate('/agendamentos')}
          >
            Ver Meus Agendamentos
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/dashboard')}
          >
            Voltar ao Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (error || !agendamento) {
    return (
      <div style={{
        maxWidth: '600px',
        margin: '40px auto',
        padding: '24px',
        backgroundColor: 'white',
        borderRadius: '8px',
        border: '1px solid #e9ecef',
        textAlign: 'center'
      }}>
        <div style={{
          backgroundColor: '#f8d7da',
          color: '#721c24',
          padding: '16px',
          borderRadius: '6px',
          marginBottom: '20px',
          border: '1px solid #f5c6cb'
        }}>
          <h2 style={{ margin: '0 0 8px 0' }}>
            ❌ Erro ao processar convite
          </h2>
          <p style={{ margin: 0 }}>
            {error || 'Agendamento não encontrado'}
          </p>
        </div>

        <Button
          variant="outline"
          onClick={() => navigate('/dashboard')}
        >
          Voltar ao Dashboard
        </Button>
      </div>
    );
  }

  const convidados = agendamento.convidados || [];
  const userConvidado = convidados.find(c => c.email === user?.email);

  return (
    <div style={{
      maxWidth: '700px',
      margin: '40px auto',
      padding: '24px',
      backgroundColor: 'white',
      borderRadius: '8px',
      border: '1px solid #e9ecef'
    }}>
      <div style={{
        textAlign: 'center',
        marginBottom: '32px'
      }}>
        <h1 style={{
          margin: '0 0 8px 0',
          color: '#212529',
          fontSize: '28px'
        }}>
          📧 Convite para Agendamento
        </h1>
        <p style={{
          margin: 0,
          color: '#6c757d',
          fontSize: '16px'
        }}>
          Você foi convidado(a) para participar do seguinte agendamento:
        </p>
      </div>

      {/* Detalhes do Agendamento */}
      <div style={{
        border: '1px solid #e9ecef',
        borderRadius: '6px',
        padding: '20px',
        marginBottom: '24px',
        backgroundColor: '#f8f9fa'
      }}>
        <h2 style={{
          margin: '0 0 16px 0',
          color: '#212529',
          fontSize: '22px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          {getTipoIcon(agendamento.tipo)} {agendamento.titulo}
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '16px',
          marginBottom: '16px'
        }}>
          <div>
            <strong style={{ fontSize: '14px', color: '#495057' }}>📅 Data e Hora:</strong>
            <p style={{ margin: '4px 0 0 0', fontSize: '16px', color: '#212529' }}>
              {formatDateTime(agendamento.data_inicio)}
            </p>
            <p style={{ margin: '2px 0 0 0', fontSize: '14px', color: '#6c757d' }}>
              até {formatDateTime(agendamento.data_fim)}
            </p>
          </div>

          <div>
            <strong style={{ fontSize: '14px', color: '#495057' }}>📋 Tipo:</strong>
            <p style={{ margin: '4px 0 0 0', fontSize: '16px', color: '#212529' }}>
              {getTipoText(agendamento.tipo)}
            </p>
          </div>

          {agendamento.local && (
            <div>
              <strong style={{ fontSize: '14px', color: '#495057' }}>📍 Local:</strong>
              <p style={{ margin: '4px 0 0 0', fontSize: '16px', color: '#212529' }}>
                {agendamento.local}
              </p>
            </div>
          )}

          <div>
            <strong style={{ fontSize: '14px', color: '#495057' }}>👤 Organizador:</strong>
            <p style={{ margin: '4px 0 0 0', fontSize: '16px', color: '#212529' }}>
              {agendamento.usuario?.nome || 'Não informado'}
            </p>
          </div>
        </div>

        {agendamento.descricao && (
          <div style={{ marginBottom: '16px' }}>
            <strong style={{ fontSize: '14px', color: '#495057' }}>📝 Descrição:</strong>
            <p style={{ margin: '4px 0 0 0', fontSize: '16px', color: '#212529' }}>
              {agendamento.descricao}
            </p>
          </div>
        )}

        {agendamento.observacoes && (
          <div>
            <strong style={{ fontSize: '14px', color: '#495057' }}>💬 Observações:</strong>
            <p style={{ margin: '4px 0 0 0', fontSize: '16px', color: '#212529' }}>
              {agendamento.observacoes}
            </p>
          </div>
        )}
      </div>

      {/* Status do Convite */}
      {userConvidado && (
        <div style={{
          padding: '16px',
          backgroundColor: userConvidado.status === 'pendente' ? '#fff3cd' : '#d4edda',
          border: '1px solid ' + (userConvidado.status === 'pendente' ? '#ffeaa7' : '#c3e6cb'),
          borderRadius: '6px',
          marginBottom: '24px'
        }}>
          <strong style={{ fontSize: '14px' }}>Status do seu convite:</strong>
          <p style={{
            margin: '4px 0 0 0',
            fontSize: '16px',
            fontWeight: '500',
            color: userConvidado.status === 'pendente' ? '#856404' : '#155724'
          }}>
            {userConvidado.status === 'pendente' ? '⏳ Aguardando resposta' : 
             userConvidado.status === 'aceito' ? '✅ Aceito' : '❌ Recusado'}
          </p>
        </div>
      )}

      {/* Botões de Ação */}
      {userConvidado && userConvidado.status === 'pendente' && (
        <div style={{
          display: 'flex',
          gap: '16px',
          justifyContent: 'center',
          padding: '20px 0'
        }}>
          <Button
            variant="success"
            onClick={() => processarResposta('aceitar')}
            disabled={processing}
            style={{
              fontSize: '16px',
              padding: '12px 24px',
              minWidth: '120px'
            }}
          >
            {processing ? 'Processando...' : '✅ Aceitar Convite'}
          </Button>
          <Button
            variant="danger"
            onClick={() => processarResposta('recusar')}
            disabled={processing}
            style={{
              fontSize: '16px',
              padding: '12px 24px',
              minWidth: '120px'
            }}
          >
            {processing ? 'Processando...' : '❌ Recusar Convite'}
          </Button>
        </div>
      )}

      {/* Botão de Voltar */}
      <div style={{
        borderTop: '1px solid #e9ecef',
        paddingTop: '20px',
        textAlign: 'center'
      }}>
        <Button
          variant="outline"
          onClick={() => navigate('/dashboard')}
        >
          Voltar ao Dashboard
        </Button>
      </div>
    </div>
  );
};

export default ConviteAgendamento;
