import React, { useState, useEffect } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { apiRequest } from '@/api/apiRequest';
import { useToast } from '@/components/common/Toast';
import Button from '@/components/common/Button';
import { formatDateTimeForInput, formatDate } from '@/utils/commonUtils';

const AgendamentoForm = ({ 
  processoId, 
  agendamento = null, 
  onSuccess, 
  onCancel,
  isEditing = false,
  processos = [] // Recebendo a lista de processos como prop
}) => {
  const { token } = useAuthContext();
  const { showSuccess, showError } = useToast();
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

  // Função para formatar data para input datetime-local
  const formatDateTimeForInput = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      
      // Ajustar para o timezone local
      const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
      
      // Formato YYYY-MM-DDTHH:mm para input datetime-local
      return localDate.toISOString().slice(0, 16);
    } catch (error) {
      console.error('Erro ao formatar data:', error);
      return '';
    }
  };

  // Calcular duração em horas
  const getDuracaoHoras = () => {
    if (!formData.data_inicio || !formData.data_fim) return null;
    const inicio = new Date(formData.data_inicio);
    const fim = new Date(formData.data_fim);
    if (isNaN(inicio.getTime()) || isNaN(fim.getTime())) return null;
    const diffMs = fim - inicio;
    const diffHoras = diffMs / (1000 * 60 * 60);
    return diffHoras > 0 ? diffHoras : 0;
  };

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

    // Se o campo alterado for data_inicio, configurar data_fim para +1 hora se estiver vazio ou igual ao antigo data_inicio
    if (name === 'data_inicio') {
      setFormData(prev => {
        let novoFim = prev.data_fim;
        const novoInicio = value;
        // Só atualizar se data_fim estiver vazio ou igual ao antigo data_inicio
        if (!prev.data_fim || prev.data_fim === prev.data_inicio) {
          const inicioDate = new Date(novoInicio);
          if (!isNaN(inicioDate.getTime())) {
            const fimDate = new Date(inicioDate.getTime() + 60 * 60 * 1000);
            // Formatar para datetime-local
            novoFim = fimDate.toISOString().slice(0,16);
          }
        }
        return {
          ...prev,
          [name]: value,
          data_fim: novoFim
        };
      });
      return;
    }

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
      showError('Email do convidado é obrigatório');
      return;
    }

    // Verificar se email já existe
    const emailExiste = formData.convidados.some(c => c.email === newConvidado.email);
    if (emailExiste) {
      showError('Este email já foi adicionado à lista de convidados');
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
    showSuccess('Convidado adicionado com sucesso!');
    setError('');
  };

  const removerConvidado = (email) => {
    setFormData(prev => ({
      ...prev,
      convidados: prev.convidados.filter(c => c.email !== email)
    }));
    showSuccess('Convidado removido com sucesso!');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      console.log('📝 Dados do formulário antes da validação:', formData);
      
      // Validação mais precisa das datas
      const dataInicio = new Date(formData.data_inicio);
      const dataFim = new Date(formData.data_fim);
      
      console.log('📅 Datas parseadas:', { dataInicio, dataFim });
      
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

      // Não enviar email_lembrete se estiver vazio
      const dataToSend = { ...formData };
      if (!dataToSend.email_lembrete) {
        delete dataToSend.email_lembrete;
      }
      if (!dataToSend.observacoes) {
        delete dataToSend.observacoes;
      }
      if (!dataToSend.descricao) {
        delete dataToSend.descricao;
      }
      
      // Converter processo_id para número
      dataToSend.processo_id = parseInt(dataToSend.processo_id);
      
      // Converter datas para formato ISO correto
      dataToSend.data_inicio = dataInicio.toISOString();
      dataToSend.data_fim = dataFim.toISOString();
      
      console.log('📅 Data início formatada:', dataToSend.data_inicio);
      console.log('📅 Data fim formatada:', dataToSend.data_fim);
      
      console.log('📦 Dados sendo enviados:', JSON.stringify(dataToSend, null, 2));

      const response = await apiRequest(endpoint, {
        method,
        body: dataToSend,
        token
      });

      if (response.success) {
        showSuccess(isEditing ? 'Agendamento atualizado com sucesso!' : 'Agendamento criado com sucesso!');
        onSuccess?.(response.data);
      } else {
        // Se há erros de validação, mostrar detalhes
        if (response.errors && Array.isArray(response.errors)) {
          const errorMessages = response.errors.map(err => err.msg).join(', ');
          throw new Error(errorMessages);
        }
        throw new Error(response.message || 'Erro ao salvar agendamento');
      }
    } catch (error) {
      console.error('Erro ao salvar agendamento:', error);
      const errorMessage = error.message || 'Erro interno do servidor';
      showError('Erro ao salvar agendamento: ' + errorMessage);
      setError(errorMessage);
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
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {isEditing ? '✏️ Editar Agendamento' : '📅 Novo Agendamento'}
        </h2>
        <p className="text-gray-600">
          {isEditing ? 'Modifique os dados do agendamento conforme necessário' : 'Preencha os dados para criar um novo agendamento'}
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center">
          <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Validação visual para datas */}
      {formData.data_inicio && formData.data_fim && (new Date(formData.data_fim) < new Date(formData.data_inicio)) && (
        <div className="bg-warning-50 border border-warning-200 text-warning-700 px-4 py-3 rounded-lg mb-6 flex items-center">
          <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>A <strong>data de fim</strong> deve ser posterior à <strong>data de início</strong>.</span>
        </div>
      )}

      {/* Validação visual para processo_id */}
      {formData.processo_id === '' && (
        <div className="bg-warning-50 border border-warning-200 text-warning-700 px-4 py-3 rounded-lg mb-6 flex items-center">
          <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <span>Selecione um <strong>processo</strong> antes de salvar o agendamento.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Seção Principal */}
        <div className="bg-gray-50 p-6 rounded-xl">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            Informações Básicas
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Título */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                📝 Título *
              </label>
              <input
                type="text"
                name="titulo"
                value={formData.titulo}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                placeholder="Ex: Reunião com cliente"
              />
            </div>

            {/* Tipo */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                🏷️ Tipo
              </label>
              <select
                name="tipo"
                value={formData.tipo}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              >
                <option value="reuniao">📋 Reunião</option>
                <option value="audiencia">⚖️ Audiência</option>
                <option value="prazo">⏰ Prazo</option>
                <option value="outro">📌 Outro</option>
              </select>
            </div>

            {/* Data e Hora de Início */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                🕐 Data e Hora de Início *
              </label>
              <input
                type="datetime-local"
                name="data_inicio"
                value={formData.data_inicio}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              />
            </div>

            {/* Data e Hora de Fim */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                🕕 Data e Hora de Fim *
              </label>
              <input
                type="datetime-local"
                name="data_fim"
                value={formData.data_fim}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              />
            </div>

            {/* Local */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                📍 Local
              </label>
              <input
                type="text"
                name="local"
                value={formData.local}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                placeholder="Ex: Sala 205, NPJ UFMT"
              />
            </div>

            {/* Email para Lembrete */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                📧 Email para Lembrete
              </label>
              <input
                type="email"
                name="email_lembrete"
                value={formData.email_lembrete}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                placeholder="seu@email.com"
              />
            </div>
          </div>
        </div>

        {/* Seção Descrições */}
        <div className="bg-blue-50 p-6 rounded-xl">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
              <path fillRule="evenodd" d="M4 5a2 2 0 012-2v1a1 1 0 001 1h6a1 1 0 001-1V3a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/>
            </svg>
            Detalhes Adicionais
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Descrição */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                📄 Descrição
              </label>
              <textarea
                name="descricao"
                value={formData.descricao}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors resize-vertical"
                placeholder="Descreva o agendamento..."
              />
            </div>

            {/* Observações */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                📝 Observações
              </label>
              <textarea
                name="observacoes"
                value={formData.observacoes}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors resize-vertical"
                placeholder="Observações adicionais..."
              />
            </div>
          </div>
        </div>

        {/* Seção de Convidados */}
        <div className="bg-green-50 p-6 rounded-xl">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
            </svg>
            Convidados
          </h3>
          
          {/* Adicionar Convidado */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 mb-6">
            <div className="lg:col-span-5">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                📧 Email do Convidado
              </label>
              <input
                type="email"
                name="email"
                value={newConvidado.email}
                onChange={handleConvidadoChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                placeholder="convidado@email.com"
              />
            </div>
            <div className="lg:col-span-5">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                👤 Nome (opcional)
              </label>
              <input
                type="text"
                name="nome"
                value={newConvidado.nome}
                onChange={handleConvidadoChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                placeholder="Nome do convidado"
              />
            </div>
            <div className="lg:col-span-2 flex items-end">
              <button
                type="button"
                onClick={adicionarConvidado}
                className="w-full px-4 py-3 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors flex items-center justify-center"
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/>
                </svg>
                Adicionar
              </button>
            </div>
          </div>

          {/* Lista de Convidados */}
          {formData.convidados.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
                </svg>
                Convidados ({formData.convidados.length})
              </h4>
              <div className="space-y-2">
                {formData.convidados.map((convidado, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                        </svg>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800">
                          {convidado.nome || convidado.email}
                        </div>
                        {convidado.nome && (
                          <div className="text-sm text-gray-600">
                            {convidado.email}
                          </div>
                        )}
                        <div className={`inline-block px-2 py-1 text-xs font-medium rounded-full mt-1 ${
                          convidado.status === 'aceito' 
                            ? 'bg-success-100 text-success-800' 
                            : convidado.status === 'recusado' 
                            ? 'bg-danger-100 text-danger-800' 
                            : 'bg-warning-100 text-warning-800'
                        }`}>
                          {getStatusText(convidado.status)}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removerConvidado(convidado.email)}
                      className="px-3 py-1 bg-danger-500 text-white font-medium rounded-lg hover:bg-danger-600 focus:ring-2 focus:ring-danger-500 focus:ring-offset-2 transition-colors flex items-center"
                    >
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd"/>
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                      </svg>
                      Remover
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Seção Processo */}
        <div className="bg-purple-50 p-6 rounded-xl">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd"/>
            </svg>
            Processo Vinculado
          </h3>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              📋 Processo vinculado *
            </label>
            <select
              name="processo_id"
              value={formData.processo_id}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              disabled={isEditing}
            >
              {isEditing
                ? (() => {
                    const processoAtual = Array.isArray(processos)
                      ? processos.find(p => p.id === formData.processo_id)
                      : null;
                    return processoAtual ? (
                      <option value={processoAtual.id}>
                        {processoAtual.numero} - {processoAtual.titulo}
                      </option>
                    ) : (
                      <option value={formData.processo_id}>Processo vinculado</option>
                    );
                  })()
                : <option value="">Selecione um processo</option>
              }
              {!isEditing && Array.isArray(processos) && processos.filter(p => p.status !== 'concluido').map(processo => (
                <option key={processo.id} value={processo.id}>
                  {processo.numero} - {processo.titulo}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="bg-gray-50 p-6 rounded-xl">
          <div className="flex flex-col sm:flex-row gap-4 justify-end">
            <button
              type="button"
              onClick={() => {
                setFormData({
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
                setError('');
                setNewConvidado({ email: '', nome: '' });
                if (onCancel) onCancel();
              }}
              disabled={loading}
              className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
              </svg>
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || (formData.data_inicio && formData.data_fim && (new Date(formData.data_fim) < new Date(formData.data_inicio)) || formData.processo_id === '')}
              className="px-6 py-3 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  Salvando...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                  {isEditing ? 'Atualizar' : 'Criar'} Agendamento
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AgendamentoForm;
