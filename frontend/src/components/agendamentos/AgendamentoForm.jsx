import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, MapPin, FileText, User } from 'lucide-react';
import { apiRequest } from '@/api/apiRequest';
import { useAuthContext } from '@/contexts/AuthContext';
import Button from '@/components/common/Button';

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
      setFormData({
        processo_id: agendamento.processo_id || '',
        summary: agendamento.summary || '',
        tipo_evento: agendamento.tipo_evento || 'Reunião',
        start: agendamento.start ? new Date(agendamento.start).toISOString().slice(0, 16) : '',
        end: agendamento.end ? new Date(agendamento.end).toISOString().slice(0, 16) : '',
        location: agendamento.location || '',
        description: agendamento.description || ''
      });
    } else {
      // Valores padrão para novo agendamento
      const now = new Date();
      const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
      
      setFormData({
        processo_id: '',
        summary: '',
        tipo_evento: 'Reunião',
        start: now.toISOString().slice(0, 16),
        end: oneHourLater.toISOString().slice(0, 16),
        location: '',
        description: ''
      });
    }
  }, [agendamento]);

  // Salvar agendamento
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.processo_id) {
      alert('Por favor, selecione um processo');
      return;
    }

    if (!formData.start || !formData.end) {
      alert('Por favor, preencha as datas de início e fim');
      return;
    }

    if (new Date(formData.start) >= new Date(formData.end)) {
      alert('A data de início deve ser anterior à data de fim');
      return;
    }

    try {
      setLoading(true);
      
      // Converter datas para ISO
      const dataToSend = {
        ...formData,
        start: new Date(formData.start).toISOString(),
        end: new Date(formData.end).toISOString()
      };

      let response;
      if (agendamento) {
        // Atualizar agendamento existente
        response = await apiRequest(`/api/agendamentos-global/${agendamento.id}`, {
          method: 'PUT',
          token,
          data: dataToSend
        });
      } else {
        // Criar novo agendamento
        response = await apiRequest(`/api/processos/${formData.processo_id}/agendamentos-processo`, {
          method: 'POST',
          token,
          data: dataToSend
        });
      }

      if (response.success) {
        alert(agendamento ? 'Agendamento atualizado com sucesso!' : 'Agendamento criado com sucesso!');
        onSave();
      } else {
        alert(`Erro: ${response.message || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.error('Erro ao salvar agendamento:', error);
      alert('Erro ao salvar agendamento');
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
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
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
                <div className="text-red-600 text-sm mb-2">Nenhum processo disponível para agendamento.</div>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
                  disabled
                >
                  <option value="">Nenhum processo encontrado</option>
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
                <option value="">Selecione um processo</option>
                {processos.map((processo) => (
                  <option key={processo.id} value={processo.id}>
                    #{processo.id} - {processo.numero_processo || 'Sem número'}
                    {processo.assistido && ` - ${processo.assistido}`}
                  </option>
                ))}
              </select>
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
              <option value="Reunião">Reunião</option>
              <option value="Audiência">Audiência</option>
              <option value="Entrevista">Entrevista</option>
              <option value="Acompanhamento">Acompanhamento</option>
              <option value="Mediação">Mediação</option>
              <option value="Perícia">Perícia</option>
              <option value="Outros">Outros</option>
            </select>
          </div>

          {/* Data e Hora */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Clock size={16} />
                Data/Hora de Início *
              </label>
              <input
                type="datetime-local"
                value={formData.start}
                onChange={(e) => updateField('start', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Clock size={16} />
                Data/Hora de Fim *
              </label>
              <input
                type="datetime-local"
                value={formData.end}
                onChange={(e) => updateField('end', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
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
              placeholder="Ex: Escritório NPJ - Sala 1, Online, Fórum..."
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
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Adicione detalhes sobre o agendamento, pauta, documentos necessários..."
            />
          </div>

          {/* Botões de ação */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              className="min-w-[120px]"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Salvando...
                </div>
              ) : (
                agendamento ? 'Atualizar' : 'Criar Agendamento'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AgendamentoForm;
