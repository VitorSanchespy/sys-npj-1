import React, { useState, useEffect } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { apiRequest } from '@/api/apiRequest';
import Button from '@/components/common/Button';
import { formatDateTimeForInput, formatDate } from '@/utils/commonUtils';

const AgendamentoForm = ({ 
  processoId, 
  agendamento = null, 
  onSuccess, 
  onCancel,
  isEditing = false 
}) => {
  const { token } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    processo_id: processoId || '',
    titulo: '',
    descricao: '',
    data_inicio: '',
    data_fim: '',
    local: '',
    tipo: 'reuniao',
    email_lembrete: '',
    observacoes: '',
    convidados: []
  });

  const [newConvidado, setNewConvidado] = useState({
    email: '',
    nome: ''
  });

  // Carregar dados do agendamento se estiver editando
  useEffect(() => {
    if (isEditing && agendamento) {
      setFormData({
        processo_id: agendamento.processo_id || processoId,
        titulo: agendamento.titulo || '',
        descricao: agendamento.descricao || '',
        data_inicio: formatDateTimeForInput(agendamento.data_inicio) || '',
        data_fim: formatDateTimeForInput(agendamento.data_fim) || '',
        local: agendamento.local || '',
        tipo: agendamento.tipo || 'reuniao',
        email_lembrete: agendamento.email_lembrete || '',
        observacoes: agendamento.observacoes || '',
        convidados: agendamento.convidados || []
      });
    }
  }, [agendamento, isEditing, processoId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleConvidadoChange = (e) => {
    const { name, value } = e.target;
    setNewConvidado(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const adicionarConvidado = () => {
    if (!newConvidado.email) {
      setError('Email do convidado é obrigatório');
      return;
    }

    // Verificar se email já existe
    const emailExiste = formData.convidados.some(c => c.email === newConvidado.email);
    if (emailExiste) {
      setError('Este email já foi adicionado à lista de convidados');
      return;
    }

    setFormData(prev => ({
      ...prev,
      convidados: [...prev.convidados, {
        ...newConvidado,
        status: 'pendente'
      }]
    }));

    setNewConvidado({ email: '', nome: '' });
    setError('');
  };

  const removerConvidado = (email) => {
    setFormData(prev => ({
      ...prev,
      convidados: prev.convidados.filter(c => c.email !== email)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validações básicas
      if (!formData.titulo.trim()) {
        throw new Error('Título é obrigatório');
      }
      if (!formData.data_inicio) {
        throw new Error('Data de início é obrigatória');
      }
      if (!formData.data_fim) {
        throw new Error('Data de fim é obrigatória');
      }
      
      // Validação mais precisa das datas
      const dataInicio = new Date(formData.data_inicio);
      const dataFim = new Date(formData.data_fim);
      
      if (isNaN(dataInicio.getTime()) || isNaN(dataFim.getTime())) {
        throw new Error('Datas inválidas');
      }
      
      // Validação corrigida: data de fim deve ser posterior (não igual) à data de início
      if (dataFim < dataInicio) {
        throw new Error('Data de fim deve ser posterior à data de início');
      }

      const endpoint = isEditing 
        ? `/api/agendamentos/${agendamento.id}`
        : '/api/agendamentos';
      
      const method = isEditing ? 'PUT' : 'POST';

      const response = await apiRequest(endpoint, {
        method,
        data: formData,
        token
      });

      if (response.success) {
        onSuccess?.(response.data);
      } else {
        throw new Error(response.message || 'Erro ao salvar agendamento');
      }
    } catch (error) {
      console.error('Erro ao salvar agendamento:', error);
      setError(error.message || 'Erro interno do servidor');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'aceito': return '#28a745';
      case 'recusado': return '#dc3545';
      default: return '#ffc107';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'aceito': return 'Aceito';
      case 'recusado': return 'Recusado';
      default: return 'Pendente';
    }
  };

  return (
    <div style={{
      backgroundColor: 'white',
      padding: '24px',
      borderRadius: '8px',
      border: '1px solid #e9ecef',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      <h2 style={{ marginBottom: '24px', color: '#212529' }}>
        {isEditing ? 'Editar Agendamento' : 'Novo Agendamento'}
      </h2>

      {error && (
        <div style={{
          backgroundColor: '#f8d7da',
          color: '#721c24',
          padding: '12px',
          borderRadius: '4px',
          marginBottom: '16px',
          border: '1px solid #f5c6cb'
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '16px',
          marginBottom: '20px'
        }}>
          {/* Título */}
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
              Título *
            </label>
            <input
              type="text"
              name="titulo"
              value={formData.titulo}
              onChange={handleInputChange}
              required
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #ced4da',
                borderRadius: '4px',
                fontSize: '14px'
              }}
              placeholder="Ex: Reunião com cliente"
            />
          </div>

          {/* Tipo */}
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
              Tipo
            </label>
            <select
              name="tipo"
              value={formData.tipo}
              onChange={handleInputChange}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #ced4da',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            >
              <option value="reuniao">Reunião</option>
              <option value="audiencia">Audiência</option>
              <option value="prazo">Prazo</option>
              <option value="outro">Outro</option>
            </select>
          </div>

          {/* Data e Hora de Início */}
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
              Data e Hora de Início *
            </label>
            <input
              type="datetime-local"
              name="data_inicio"
              value={formData.data_inicio}
              onChange={handleInputChange}
              required
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #ced4da',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            />
          </div>

          {/* Data e Hora de Fim */}
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
              Data e Hora de Fim *
            </label>
            <input
              type="datetime-local"
              name="data_fim"
              value={formData.data_fim}
              onChange={handleInputChange}
              required
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #ced4da',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            />
          </div>

          {/* Local */}
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
              Local
            </label>
            <input
              type="text"
              name="local"
              value={formData.local}
              onChange={handleInputChange}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #ced4da',
                borderRadius: '4px',
                fontSize: '14px'
              }}
              placeholder="Ex: Sala 205, NPJ UFMT"
            />
          </div>

          {/* Email para Lembrete */}
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
              Email para Lembrete
            </label>
            <input
              type="email"
              name="email_lembrete"
              value={formData.email_lembrete}
              onChange={handleInputChange}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #ced4da',
                borderRadius: '4px',
                fontSize: '14px'
              }}
              placeholder="seu@email.com"
            />
          </div>
        </div>

        {/* Descrição */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
            Descrição
          </label>
          <textarea
            name="descricao"
            value={formData.descricao}
            onChange={handleInputChange}
            rows={3}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #ced4da',
              borderRadius: '4px',
              fontSize: '14px',
              resize: 'vertical'
            }}
            placeholder="Descreva o agendamento..."
          />
        </div>

        {/* Observações */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
            Observações
          </label>
          <textarea
            name="observacoes"
            value={formData.observacoes}
            onChange={handleInputChange}
            rows={2}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #ced4da',
              borderRadius: '4px',
              fontSize: '14px',
              resize: 'vertical'
            }}
            placeholder="Observações adicionais..."
          />
        </div>

        {/* Seção de Convidados */}
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ marginBottom: '16px', color: '#495057' }}>
            Convidados
          </h3>
          
          {/* Adicionar Convidado */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr auto',
            gap: '8px',
            marginBottom: '16px',
            alignItems: 'end'
          }}>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', fontSize: '14px' }}>
                Email do Convidado
              </label>
              <input
                type="email"
                name="email"
                value={newConvidado.email}
                onChange={handleConvidadoChange}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #ced4da',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
                placeholder="convidado@email.com"
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', fontSize: '14px' }}>
                Nome (opcional)
              </label>
              <input
                type="text"
                name="nome"
                value={newConvidado.nome}
                onChange={handleConvidadoChange}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #ced4da',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
                placeholder="Nome do convidado"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={adicionarConvidado}
              style={{ marginBottom: '0' }}
            >
              Adicionar
            </Button>
          </div>

          {/* Lista de Convidados */}
          {formData.convidados.length > 0 && (
            <div style={{
              border: '1px solid #e9ecef',
              borderRadius: '4px',
              padding: '12px'
            }}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#495057' }}>
                Convidados ({formData.convidados.length})
              </h4>
              {formData.convidados.map((convidado, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 12px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '4px',
                    marginBottom: index < formData.convidados.length - 1 ? '8px' : '0'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: '500', fontSize: '14px' }}>
                      {convidado.nome || convidado.email}
                    </div>
                    {convidado.nome && (
                      <div style={{ fontSize: '12px', color: '#6c757d' }}>
                        {convidado.email}
                      </div>
                    )}
                    <div style={{
                      display: 'inline-block',
                      padding: '2px 6px',
                      fontSize: '11px',
                      fontWeight: '500',
                      borderRadius: '3px',
                      color: 'white',
                      backgroundColor: getStatusBadgeColor(convidado.status),
                      marginTop: '4px'
                    }}>
                      {getStatusText(convidado.status)}
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="danger"
                    onClick={() => removerConvidado(convidado.email)}
                    style={{ fontSize: '12px', padding: '4px 8px' }}
                  >
                    Remover
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Botões */}
        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'flex-end',
          borderTop: '1px solid #e9ecef',
          paddingTop: '20px'
        }}>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
          >
            {loading ? 'Salvando...' : (isEditing ? 'Atualizar' : 'Criar')} Agendamento
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AgendamentoForm;
