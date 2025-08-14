import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, MapPin, FileText, User } from 'lucide-react';
import { apiRequest } from '@/api/apiRequest';
import { useAuthContext } from '@/contexts/AuthContext';
import Button from '@/components/common/Button';
import { toBrasiliaISO, toDateTimeLocalBrasilia, formatToBrasilia } from '@/utils/timezone';

const AgendamentoForm = ({ agendamento, processos, onClose, onSave }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    processo_id: '',
    summary: '',
    tipo_evento: 'Reunião',
    start: '',
    end: '',
    location: '',
    description: ''
  });

  const { token } = useAuthContext();

  // Inicializar dados do formulário
  useEffect(() => {
    if (agendamento) {
      const startFormatted = agendamento.start ? toDateTimeLocalBrasilia(agendamento.start) : 
               agendamento.dataEvento ? toDateTimeLocalBrasilia(agendamento.dataEvento) :
               agendamento.data_evento ? toDateTimeLocalBrasilia(agendamento.data_evento) : '';
      const endFormatted = agendamento.end ? toDateTimeLocalBrasilia(agendamento.end) : 
             agendamento.dataFim ? toDateTimeLocalBrasilia(agendamento.dataFim) :
             agendamento.data_fim ? toDateTimeLocalBrasilia(agendamento.data_fim) : '';
      
      setFormData({
        processo_id: agendamento.processo_id || '',
        summary: agendamento.summary || agendamento.titulo || '',
        tipo_evento: agendamento.tipo_evento || agendamento.tipoEvento || 'Reunião',
        start: startFormatted,
        end: endFormatted,
        location: agendamento.location || agendamento.local || '',
        description: agendamento.description || agendamento.descricao || ''
      });
    } else {
      // Valores padrão para novo agendamento - sempre no futuro, em horário de Brasília
      const now = new Date();
      // Adicionar 1 hora para garantir que seja no futuro
      const futureTime = new Date(now.getTime() + 60 * 60 * 1000);
      const oneHourLater = new Date(futureTime.getTime() + 60 * 60 * 1000);
      
      setFormData({
        processo_id: '',
        summary: '',
        tipo_evento: 'Reunião',
        start: toDateTimeLocalBrasilia(futureTime),
        end: toDateTimeLocalBrasilia(oneHourLater),
        location: '',
        description: ''
      });
    }
  }, [agendamento]);

  // Salvar agendamento
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validações básicas
    if (!formData.summary.trim()) {
      alert('Título é obrigatório');
      return;
    }
    
    if (!formData.start || !formData.end) {
      alert('Datas de início e fim são obrigatórias');
      return;
    }
    
    if (!formData.processo_id && !agendamento) {
      alert('Selecione um processo');
      return;
    }

    try {
      setLoading(true);
      
      // Converter datas para formato ISO padronizado do sistema (fuso Brasília)
      const startISO = toBrasiliaISO(formData.start);
      const endISO = toBrasiliaISO(formData.end);
      
      // Verificar se as datas não estão no passado
      const startDate = new Date(startISO);
      const endDate = new Date(endISO);
      const now = new Date();
      
      if (startDate < now) {
        alert('A data de início não pode ser no passado');
        return;
      }
      
      if (endDate <= startDate) {
        alert('A data de fim deve ser posterior à data de início');
        return;
      }
      
      // Payload limpo sem redundâncias
      const dataToSend = {
        titulo: formData.summary,
        descricao: formData.description,
        local: formData.location,
        tipo_evento: formData.tipo_evento,
        dataInicio: startISO,
        dataFim: endISO,
        processo_id: formData.processo_id,
        lembrete_1_dia: true
      };

      let response;
      if (agendamento) {
        // Atualizar agendamento existente
        response = await apiRequest(`/api/agendamentos/${agendamento.id}`, {
          method: 'PUT',
          token,
          body: dataToSend
        });
      } else {
        // Criar novo agendamento
        response = await apiRequest('/api/agendamentos', {
          method: 'POST',
          token,
          body: dataToSend
        });
      }

      if (response.success) {
        alert(agendamento ? 'Agendamento atualizado com sucesso!' : 'Agendamento criado com sucesso!');
        onSave();
      } else {
        const errorMsg = response.error || response.message || 'Erro desconhecido';
        alert(`Erro: ${errorMsg}`);
      }
    } catch (error) {
      console.error('Erro ao salvar agendamento:', error);
      const errorMsg = error.message || 'Erro desconhecido';
      alert(`Erro ao salvar agendamento: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  // Atualizar campo do formulário
  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {agendamento ? 'Editar Agendamento' : 'Novo Agendamento'}
          </h2>
          <button
            onClick={onClose}
            className="bg-red-600 hover:bg-red-700 text-white p-2 rounded transition-colors"
            title="Cancelar"
          >
            <X size={24} className="text-white" />
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Seleção de Processo */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <User size={16} />
              Processo *
            </label>
            {processos.length === 0 ? (
              <div>
                <div className="text-red-600 text-sm mb-2">
                  Nenhum processo ativo disponível para agendamento.
                </div>
                <div className="text-gray-600 text-sm mb-2">
                  💡 Processos concluídos, finalizados ou arquivados não podem receber novos agendamentos.
                </div>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
                  disabled
                >
                  <option value="">Nenhum processo ativo encontrado</option>
                </select>
              </div>
            ) : (
              <select
                value={formData.processo_id}
                onChange={(e) => updateField('processo_id', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled={!!agendamento}
              >
                <option value="">Selecione um processo ativo</option>
                {processos.map((processo) => (
                  <option key={processo.id} value={processo.id}>
                    #{processo.id} - {processo.numero_processo || 'Sem número'}
                    {processo.assistido && ` - ${processo.assistido}`}
                    {processo.status && ` (${processo.status})`}
                  </option>
                ))}
              </select>
            )}
            {processos.length > 0 && (
              <div className="text-green-600 text-sm mt-1">
                ✅ {processos.length} processo(s) ativo(s) disponível(is)
              </div>
            )}
          </div>

          {/* Título */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <FileText size={16} />
              Título do Agendamento *
            </label>
            <input
              type="text"
              value={formData.summary}
              onChange={(e) => updateField('summary', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ex: Reunião inicial com cliente"
              required
            />
          </div>

          {/* Tipo de Evento */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Calendar size={16} />
              Tipo de Evento
            </label>
            <select
              value={formData.tipo_evento}
              onChange={(e) => updateField('tipo_evento', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="reuniao">Reunião</option>
              <option value="audiencia">Audiência</option>
              <option value="entrevista">Entrevista</option>
              <option value="acompanhamento">Acompanhamento</option>
              <option value="mediacao">Mediação</option>
              <option value="pericia">Perícia</option>
              <option value="diligencia">Diligência</option>
              <option value="outro">Outros</option>
            </select>
          </div>

          {/* Data e Hora */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Clock size={16} />
                Data/Hora de Início * 🇧🇷
              </label>
              <input
                type="datetime-local"
                value={formData.start}
                onChange={(e) => updateField('start', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                min={new Date().toISOString().slice(0, 16)}
              />
              <div className="text-xs text-gray-500 mt-1">
                🕒 Horário de Brasília (GMT-3)
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Clock size={16} />
                Data/Hora de Fim * 🇧🇷
              </label>
              <input
                type="datetime-local"
                value={formData.end}
                onChange={(e) => updateField('end', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                min={formData.start || new Date().toISOString().slice(0, 16)}
              />
              <div className="text-xs text-gray-500 mt-1">
                🕒 Horário de Brasília (GMT-3)
              </div>
            </div>
          </div>

          {/* Local */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <MapPin size={16} />
              Local
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => updateField('location', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ex: Sala 101, NPJ"
            />
          </div>

          {/* Descrição */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <FileText size={16} />
              Descrição
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => updateField('description', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
              placeholder="Informações adicionais sobre o agendamento..."
            />
          </div>

          {/* Aviso sobre horários */}
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <Clock className="h-5 w-5 text-blue-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Informações sobre Horários
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <ul className="list-disc list-inside space-y-1">
                    <li>Todos os horários são em <strong>horário de Brasília (GMT-3)</strong></li>
                    <li>O horário será <strong>sincronizado automaticamente</strong> com seu Google Calendar</li>
                    <li>Você verá o <strong>mesmo horário</strong> tanto no sistema quanto no Google Calendar</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded flex items-center gap-2"
              title="Cancelar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash2 lucide-trash-2 text-white" aria-hidden="true"><path d="M10 11v6"></path><path d="M14 11v6"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path><path d="M3 6h18"></path><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              <span>Cancelar</span>
            </button>
            <button
              type="submit"
              disabled={loading || (!formData.summary.trim()) || (!formData.start) || (!formData.end) || (!formData.processo_id && !agendamento)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2"
              title={agendamento ? 'Editar' : 'Criar'}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <svg className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" viewBox="0 0 24 24" />
                  Salvando...
                </div>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-square-pen text-white" aria-hidden="true"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"></path></svg>
                  <span>{agendamento ? 'Atualizar Agendamento' : 'Criar Agendamento'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AgendamentoForm;
