import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Filter } from 'lucide-react';
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
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="text-lg text-blue-700 font-semibold animate-pulse">Carregando agendamentos...</div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-lg p-4 sm:p-6 transition-all duration-300">
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-blue-900">Meus Agendamentos</h1>
            <button
              onClick={criarNovoAgendamento}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2 shadow font-semibold"
            >
              <Plus className="w-5 h-5" />
              Novo
            </button>
          </div>
        </div>
        {/* Lista de Agendamentos usando componente */}
        <AgendamentosLista 
          agendamentos={agendamentos}
          onEdit={abrirEdicao}
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
          onEnviarLembrete={enviarLembrete}
          compact={true}
        />
      </div>
    </div>
  );
};

export default AgendamentosPage;
