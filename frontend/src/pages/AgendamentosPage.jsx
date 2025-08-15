import React, { useState, useEffect, useCallback } from 'react';
import { 
  Calendar, 
  Clock, 
  Plus, 
  Edit, 
  Trash2, 
  MapPin, 
  Mail, 
  User,
  Filter,
  Search,
  AlertCircle,
  CheckCircle,
  XCircle,
  Send,
  Users
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import AgendamentosLista from '../components/agendamentos/AgendamentosLista';

const AgendamentosPage = () => {
  const navigate = useNavigate();
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
      const [agendamentosRes, processosRes] = await Promise.all([
        api.get('/api/agendamentos'),
        api.get('/api/processos')
      ]);

      if (agendamentosRes.data?.success) {
        setAgendamentos(agendamentosRes.data.data || []);
      }

      if (processosRes.data?.success) {
        setProcessos(processosRes.data.data || []);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setError('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  }, []);

  // Aplicar filtros
  const carregarAgendamentos = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      Object.entries(filtros).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await api.get(`/api/agendamentos?${params}`);
      
      if (response.data?.success) {
        setAgendamentos(response.data.data || []);
      }
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error);
      setError('Erro ao carregar agendamentos');
    } finally {
      setLoading(false);
    }
  }, [filtros]);

  useEffect(() => {
    carregarAgendamentos();
  }, [carregarAgendamentos]);

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja deletar este agendamento?')) {
      return;
    }

    try {
      const response = await api.delete(`/api/agendamentos/${id}`);
      
      if (response.data?.success) {
        await carregarAgendamentos();
        setError('');
      }
    } catch (error) {
      console.error('Erro ao deletar:', error);
      setError('Erro ao deletar agendamento');
    }
  };

  const handleStatusChange = async (id, novoStatus) => {
    try {
      const response = await api.patch(`/api/agendamentos/${id}/status`, {
        status: novoStatus
      });
      
      if (response.data?.success) {
        await carregarAgendamentos();
      }
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      setError('Erro ao alterar status');
    }
  };

  const enviarLembrete = async (id) => {
    try {
      const response = await api.post(`/api/agendamentos/${id}/lembrete`);
      
      if (response.data?.success) {
        await carregarAgendamentos();
        alert('Lembrete enviado com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao enviar lembrete:', error);
      setError('Erro ao enviar lembrete');
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
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Carregando agendamentos...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-gray-900">Agendamentos Individualizados</h1>
          <button
            onClick={criarNovoAgendamento}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Novo Agendamento
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Filtros */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <select
              value={filtros.status}
              onChange={(e) => setFiltros({...filtros, status: e.target.value})}
              className="border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="">Todos os Status</option>
              <option value="pendente">Pendente</option>
              <option value="confirmado">Confirmado</option>
              <option value="concluido">Concluído</option>
              <option value="cancelado">Cancelado</option>
            </select>

            <select
              value={filtros.tipo}
              onChange={(e) => setFiltros({...filtros, tipo: e.target.value})}
              className="border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="">Todos os Tipos</option>
              <option value="reuniao">Reunião</option>
              <option value="audiencia">Audiência</option>
              <option value="prazo">Prazo</option>
              <option value="outro">Outro</option>
            </select>

            <select
              value={filtros.processo_id}
              onChange={(e) => setFiltros({...filtros, processo_id: e.target.value})}
              className="border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="">Todos os Processos</option>
              {processos.map(processo => (
                <option key={processo.id} value={processo.id}>
                  {processo.numero} - {processo.titulo?.substring(0, 30)}...
                </option>
              ))}
            </select>

            <input
              type="datetime-local"
              value={filtros.data_inicio}
              onChange={(e) => setFiltros({...filtros, data_inicio: e.target.value})}
              className="border border-gray-300 rounded-lg px-3 py-2"
              placeholder="Data início"
            />

            <input
              type="datetime-local"
              value={filtros.data_fim}
              onChange={(e) => setFiltros({...filtros, data_fim: e.target.value})}
              className="border border-gray-300 rounded-lg px-3 py-2"
              placeholder="Data fim"
            />
          </div>
        </div>
      </div>

      {/* Lista de Agendamentos usando componente */}
      <AgendamentosLista 
        agendamentos={agendamentos}
        onEdit={abrirEdicao}
        onDelete={handleDelete}
        onStatusChange={handleStatusChange}
        onEnviarLembrete={enviarLembrete}
      />
    </div>
  );
};

export default AgendamentosPage;
