import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { tabelaAuxiliarService, processService } from '../api/services';
import { useAuthContext } from '../contexts/AuthContext';
import CampoAuxiliarComControle from './common/CampoAuxiliarComControle';

const FullProcessCreateForm = () => {
  const { token, user } = useAuthContext();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
  numero_processo: '',
  titulo: '',
  num_processo_sei: '',
  assistido: '',
  contato_assistido: '',
  descricao: '',
  status: 'Em andamento',
  materia_assunto_id: '',
  local_tramitacao_id: '',
  sistema: 'Físico',
  fase_id: '',
  diligencia_id: '',
  });

  const [materias, setMaterias] = useState([]);
  const [fases, setFases] = useState([]);
  const [diligencias, setDiligencias] = useState([]);
  const [localTramitacoes, setLocalTramitacoes] = useState([]);

  // Como não precisamos mais carregar dados aqui (CampoAuxiliarComControle faz isso),
  // removemos o useEffect e funções relacionadas

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    try {
      setLoading(true);
      const userId = user?.id || null;
      await processService.createProcess(token, {
        ...formData,
        idusuario_responsavel: userId
      });
      alert('Processo criado com sucesso!');
      navigate('/processos');
    } catch (error) {
      console.error('Erro ao criar processo:', error, error.response?.data);
      alert(`Erro ao criar processo: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Tem certeza que deseja cancelar? Todos os dados serão perdidos.')) {
      navigate('/processos');
    }
  };

  const renderField = (label, name, placeholder, required = false, component = 'input', type = 'text', rows = 3) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {component === 'input' ? (
        <input
          type={type}
          name={name}
          value={formData[name] || ''}
          onChange={handleChange}
          placeholder={placeholder}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
          required={required}
        />
      ) : (
        <textarea
          name={name}
          value={formData[name] || ''}
          onChange={handleChange}
          placeholder={placeholder}
          rows={rows}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none text-sm"
          required={required}
        />
      )}
    </div>
  );

  const renderSelect = (label, name, options, required = false) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        name={name}
        value={formData[name]}
        onChange={handleChange}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
        required={required}
      >
        {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Cadastrar Novo Processo</h1>
        <p className="text-gray-600 mt-1">Preencha os campos abaixo para criar um novo processo no sistema.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
            
            {/* Coluna da Esquerda */}
            <div className="space-y-5">
              <h3 className="text-base font-semibold text-gray-800 border-b pb-2">
                Informações Básicas
              </h3>
              {renderField('Número do Processo', 'numero_processo', 'Ex: 0001234-56.2025.8.11.0001', true)}
              {renderField('Título', 'titulo', 'Título do processo', true)}
              {renderField('Número SEI', 'num_processo_sei', 'Ex: SEI-23085.012345/2025-67')}
              {renderField('Assistido/a', 'assistido', 'Nome completo do assistido')}
              {renderField('Contato do Assistido', 'contato_assistido', 'Telefone ou e-mail', true)}
              {renderField('Descrição', 'descricao', 'Descreva o caso ou a situação jurídica', true, 'textarea')}
              <div className="grid grid-cols-2 gap-4">
                {renderSelect('Status', 'status', [
                  { value: 'Em andamento', label: 'Em andamento' },
                  { value: 'Aguardando', label: 'Aguardando' },
                  { value: 'Finalizado', label: 'Finalizado' },
                  { value: 'Arquivado', label: 'Arquivado' },
                ], true)}
                {renderSelect('Sistema', 'sistema', [
                  { value: 'Físico', label: 'Físico' },
                  { value: 'PJE', label: 'PJE' },
                  { value: 'PEA', label: 'PEA' },
                ], true)}
              </div>
            </div>

            {/* Coluna da Direita */}
            <div className="space-y-5">
              <h3 className="text-base font-semibold text-gray-800 border-b pb-2">
                Categorização
              </h3>
              {/* Remove SVG icons from SelectWithAdd buttons and improve user feedback */}
              <CampoAuxiliarComControle
                type="materia"
                label="Matéria/Assunto"
                value={formData.materia_assunto_id}
                onChange={(value) => setFormData({...formData, materia_assunto_id: value})}
                placeholder="Selecione a matéria/assunto"
                required
              />
              <CampoAuxiliarComControle
                type="fase"
                label="Fase"
                value={formData.fase_id}
                onChange={(value) => setFormData({...formData, fase_id: value})}
                placeholder="Selecione a fase"
                required
              />
              <CampoAuxiliarComControle
                type="diligencia"
                label="Diligência"
                value={formData.diligencia_id}
                onChange={(value) => setFormData({...formData, diligencia_id: value})}
                placeholder="Selecione a diligência"
                required
              />
              <CampoAuxiliarComControle
                type="local_tramitacao"
                label="Local de Tramitação"
                value={formData.local_tramitacao_id}
                onChange={(value) => setFormData({...formData, local_tramitacao_id: value})}
                placeholder="Selecione o local de tramitação"
                required
              />
            </div>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 rounded-b-lg">
          <div className="flex justify-end items-center space-x-4">
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className="mt-2 text-xs font-medium text-blue-600 hover:text-blue-800 border-none bg-transparent px-4 py-2 rounded transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all duration-200 flex items-center gap-2"
            >
              {loading ? (
                'Salvando...'
              ) : (
                'Criar Processo'
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default FullProcessCreateForm;