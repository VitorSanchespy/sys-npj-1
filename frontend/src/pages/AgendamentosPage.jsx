import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { Plus, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useToast, ToastContainer } from '../components/common/Toast';
import AgendamentosLista from '../components/agendamentos/AgendamentosLista';

const AgendamentosPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showSuccess, showError, toasts, removeToast } = useToast();
  const [agendamentos, setAgendamentos] = useState([]);
  const [processos, setProcessos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtros, setFiltros] = useState({
    status: '',
    tipo: '',
    processo_id: '',
    data_inicio: '',
    data_fim: ''
  });

  // Carregar dados iniciais
  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = useCallback(async () => {
    try {
      setLoading(true);
      console.log('🔄 Carregando dados iniciais...');
      
      const [agendamentosRes, processosRes] = await Promise.all([
        api.get('/api/agendamentos'),
        api.get('/api/processos')
      ]);

      console.log('📅 Resposta agendamentos:', agendamentosRes);
      console.log('📋 Resposta processos:', processosRes);

      if (agendamentosRes.data?.success) {
        const agendamentosData = agendamentosRes.data.data || [];
        console.log('✅ Agendamentos carregados:', agendamentosData.length, agendamentosData);
        setAgendamentos(agendamentosData);
      } else {
        console.warn('⚠️ Resposta de agendamentos sem success:', agendamentosRes);
        setAgendamentos([]);
      }

      if (processosRes.data?.success) {
        setProcessos(processosRes.data.data || []);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error);
      setError('Erro ao carregar dados: ' + (error.message || error));
    } finally {
      setLoading(false);
    }
  }, []);

  // Aplicar filtros
  const carregarAgendamentos = useCallback(async () => {
    try {
      setLoading(true);
      console.log('🔍 Aplicando filtros:', filtros);
      
      const params = new URLSearchParams();
      
      Object.entries(filtros).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const url = `/api/agendamentos?${params}`;
      console.log('🌐 URL da requisição:', url);
      
      const response = await api.get(url);
      console.log('📊 Resposta filtrada:', response);
      
      if (response.data?.success) {
        const agendamentosData = response.data.data || [];
        console.log('✅ Agendamentos filtrados:', agendamentosData.length, agendamentosData);
        setAgendamentos(agendamentosData);
      } else {
        console.warn('⚠️ Resposta sem success:', response);
        setAgendamentos([]);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar agendamentos:', error);
      setError('Erro ao carregar agendamentos: ' + (error.message || error));
    } finally {
      setLoading(false);
    }
  }, [filtros]);

  useEffect(() => {
    // Se veio da criação, força reload
    if (location.state && location.state.reload) {
      carregarAgendamentos();
      // Limpa o state para evitar reloads futuros
      navigate(location.pathname, { replace: true, state: {} });
    } else {
      carregarAgendamentos();
    }
  }, [carregarAgendamentos, location.state, navigate, location.pathname]);

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja deletar este agendamento?')) {
      return;
    }

    try {
      const response = await api.delete(`/api/agendamentos/${id}`);
      
      if (response.data?.success) {
        await carregarAgendamentos();
        showSuccess('Agendamento deletado com sucesso!');
      } else {
        showError('Falha ao deletar: ' + (response.data?.message || 'Erro desconhecido'));
      }
    } catch (error) {
      console.error('Erro ao deletar:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Erro ao deletar agendamento';
      showError('Erro ao deletar: ' + errorMessage);
    }
  };

  const handleStatusChange = async (id, novoStatus) => {
    try {
      const response = await api.patch(`/api/agendamentos/${id}/status`, {
        status: novoStatus
      });
      
      if (response.data?.success) {
        await carregarAgendamentos();
        showSuccess('Status alterado com sucesso!');
      } else {
        showError('Falha ao alterar status: ' + (response.data?.message || 'Erro desconhecido'));
      }
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Erro ao alterar status';
      showError('Erro ao alterar status: ' + errorMessage);
    }
  };

  const enviarLembrete = async (id) => {
    try {
      const response = await api.post(`/api/agendamentos/${id}/lembrete`);
      
      if (response.data?.success) {
        await carregarAgendamentos();
        showSuccess('Lembrete enviado com sucesso!');
      } else {
        showError('Falha ao enviar lembrete: ' + (response.data?.message || 'Erro desconhecido'));
      }
    } catch (error) {
      console.error('Erro ao enviar lembrete:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Erro ao enviar lembrete';
      showError('Erro ao enviar lembrete: ' + errorMessage);
    }
  };

  const abrirEdicao = (agendamento) => {
    navigate(`/agendamentos/${agendamento.id}/editar`);
  };

  const criarNovoAgendamento = () => {
    navigate('/agendamentos/novo');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
          <div className="flex items-center space-x-3">
            <svg className="animate-spin w-6 h-6 text-primary-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
            <span className="text-lg font-semibold text-gray-700">Carregando agendamentos...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <svg className="w-8 h-8 mr-3 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
                </svg>
                📅 Agendamentos
              </h1>
              <p className="text-gray-600 mt-1">
                Gerencie seus agendamentos, reuniões e compromissos do NPJ
              </p>
            </div>
            <button
              onClick={criarNovoAgendamento}
              className="inline-flex items-center px-6 py-3 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors shadow-lg"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/>
              </svg>
              Novo Agendamento
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8">
          <div className="flex items-center mb-4">
            <svg className="w-5 h-5 mr-2 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd"/>
            </svg>
            <h2 className="text-lg font-semibold text-gray-800">Filtros</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filtros.status}
                onChange={(e) => setFiltros({...filtros, status: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              >
                <option value="">Todos os status</option>
                <option value="pendente">📋 Pendente</option>
                <option value="confirmado">✅ Confirmado</option>
                <option value="cancelado">❌ Cancelado</option>
              </select>
            </div>

            {/* Tipo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
              <select
                value={filtros.tipo}
                onChange={(e) => setFiltros({...filtros, tipo: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              >
                <option value="">Todos os tipos</option>
                <option value="reuniao">📋 Reunião</option>
                <option value="audiencia">⚖️ Audiência</option>
                <option value="prazo">⏰ Prazo</option>
                <option value="outro">📌 Outro</option>
              </select>
            </div>

            {/* Processo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Processo</label>
              <select
                value={filtros.processo_id}
                onChange={(e) => setFiltros({...filtros, processo_id: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              >
                <option value="">Todos os processos</option>
                {processos.map(processo => (
                  <option key={processo.id} value={processo.id}>
                    {processo.numero} - {processo.titulo}
                  </option>
                ))}
              </select>
            </div>

            {/* Data Início */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Data Início</label>
              <input
                type="date"
                value={filtros.data_inicio}
                onChange={(e) => setFiltros({...filtros, data_inicio: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              />
            </div>

            {/* Data Fim */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Data Fim</label>
              <input
                type="date"
                value={filtros.data_fim}
                onChange={(e) => setFiltros({...filtros, data_fim: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              />
            </div>
          </div>

          {/* Botão Limpar Filtros */}
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => setFiltros({
                status: '',
                tipo: '',
                processo_id: '',
                data_inicio: '',
                data_fim: ''
              })}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd"/>
              </svg>
              Limpar Filtros
            </button>
          </div>
        </div>

        {/* Lista de Agendamentos */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center">
              <svg className="w-5 h-5 mr-2 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              Lista de Agendamentos (<span id="agendamentos-count">{agendamentos && Array.isArray(agendamentos) ? agendamentos.length : 0}</span>)
            </h2>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center">
              <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <AgendamentosLista 
            agendamentos={agendamentos}
            onEdit={abrirEdicao}
            onDelete={handleDelete}
            onStatusChange={handleStatusChange}
            onEnviarLembrete={enviarLembrete}
            compact={false}
          />
        </div>
      </div>
      
      {/* Container de Toasts */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
};

export default AgendamentosPage;
