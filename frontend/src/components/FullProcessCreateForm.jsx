import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { tabelaAuxiliarService, processService } from '../api/services';
import { useAuthContext } from '../contexts/AuthContext';
import SelectWithAdd from './common/SelectWithAdd'; // Importando o novo componente

const FullProcessCreateForm = () => {
  const { token, user } = useAuthContext();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    numero_processo: '',
    num_processo_sei: '',
    assistido: '',
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
  const [contatoAssistido, setContatoAssistido] = useState('');

  const [newValues, setNewValues] = useState({
    materiaAssunto: '',
    localTramitacao: '',
    fase: '',
    diligencia: '',
  });

  const [showAddForms, setShowAddForms] = useState({
    materiaAssunto: false,
    localTramitacao: false,
    fase: false,
    diligencia: false,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!token) throw new Error('Token não encontrado.');
        setLoading(true);
        const [materiasRes, fasesRes, diligenciasRes, localTramitacoesRes] = await Promise.all([
          tabelaAuxiliarService.getMateriaAssunto(token),
          tabelaAuxiliarService.getFase(token),
          tabelaAuxiliarService.getDiligencia(token),
          tabelaAuxiliarService.getLocalTramitacao(token),
        ]);
        setMaterias(materiasRes);
        setFases(fasesRes);
        setDiligencias(diligenciasRes);
        setLocalTramitacoes(localTramitacoesRes);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        alert(`Erro ao carregar dados auxiliares: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleNewValueChange = (field, value) => {
    setNewValues(prev => ({ ...prev, [field]: value }));
  };

  const toggleAddForm = (field, show) => {
    setShowAddForms(prev => ({ ...prev, [field]: show }));
    if (!show) {
      handleNewValueChange(field, ''); // Limpa o campo ao fechar
    }
  };

  const handleAddNewValue = async (field) => {
    const value = newValues[field];
    if (!value.trim()) {
      alert('Por favor, digite um valor válido.');
      return;
    }

    const services = {
      materiaAssunto: { create: tabelaAuxiliarService.createMateriaAssunto, fetch: tabelaAuxiliarService.getMateriaAssunto, setter: setMaterias, fieldName: 'materia_assunto_id' },
      localTramitacao: { create: tabelaAuxiliarService.createLocalTramitacao, fetch: tabelaAuxiliarService.getLocalTramitacao, setter: setLocalTramitacoes, fieldName: 'local_tramitacao_id' },
      fase: { create: tabelaAuxiliarService.createFase, fetch: tabelaAuxiliarService.getFase, setter: setFases, fieldName: 'fase_id' },
      diligencia: { create: tabelaAuxiliarService.createDiligencia, fetch: tabelaAuxiliarService.getDiligencia, setter: setDiligencias, fieldName: 'diligencia_id' },
    };

    const service = services[field];
    if (!service) return;

    try {
      setLoading(true);
      const response = await service.create(token, value);
      const updatedData = await service.fetch(token);
      service.setter(updatedData);

      setFormData(prev => ({ ...prev, [service.fieldName]: response.id }));
      toggleAddForm(field, false);
      alert(`${value} adicionado com sucesso e selecionado!`);
    } catch (error) {
      console.error(`Erro ao adicionar novo valor em ${field}:`, error);
      alert(`Erro ao adicionar novo valor: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    
    try {
      setLoading(true);
      const userId = user?.id || null;
      await processService.createProcess(token, { 
        ...formData, 
        contato_assistido: contatoAssistido, 
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
          value={name === 'contatoAssistido' ? contatoAssistido : formData[name]}
          onChange={name === 'contatoAssistido' ? (e) => setContatoAssistido(e.target.value) : handleChange}
          placeholder={placeholder}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
          required={required}
        />
      ) : (
        <textarea
          name={name}
          value={formData[name]}
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
              <h3 className="text-base font-semibold text-gray-800 border-b pb-2 flex items-center">
                <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                Informações Básicas
              </h3>
              {renderField('Número do Processo', 'numero_processo', 'Ex: 0001234-56.2025.8.11.0001', true)}
              {renderField('Número SEI', 'num_processo_sei', 'Ex: SEI-23085.012345/2025-67')}
              {renderField('Assistido/a', 'assistido', 'Nome completo do assistido')}
              {renderField('Contato do Assistido', 'contatoAssistido', 'Telefone ou e-mail')}
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
              <h3 className="text-base font-semibold text-gray-800 border-b pb-2 flex items-center">
                <svg className="w-4 h-4 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path></svg>
                Categorização
              </h3>
              <SelectWithAdd
                label="Matéria/Assunto *"
                stateKey="materia_assunto_id"
                value={formData.materia_assunto_id}
                onChange={handleChange}
                options={materias}
                showAddForm={showAddForms.materiaAssunto}
                onToggleAddForm={(show) => toggleAddForm('materiaAssunto', show)}
                newValue={newValues.materiaAssunto}
                onNewValueChange={(e) => handleNewValueChange('materiaAssunto', e.target.value)}
                onAddNew={() => handleAddNewValue('materiaAssunto')}
                placeholder="matéria/assunto"
                loading={loading}
              />
              <SelectWithAdd
                label="Fase *"
                stateKey="fase_id"
                value={formData.fase_id}
                onChange={handleChange}
                options={fases}
                showAddForm={showAddForms.fase}
                onToggleAddForm={(show) => toggleAddForm('fase', show)}
                newValue={newValues.fase}
                onNewValueChange={(e) => handleNewValueChange('fase', e.target.value)}
                onAddNew={() => handleAddNewValue('fase')}
                placeholder="fase"
                loading={loading}
              />
              <SelectWithAdd
                label="Diligência *"
                stateKey="diligencia_id"
                value={formData.diligencia_id}
                onChange={handleChange}
                options={diligencias}
                showAddForm={showAddForms.diligencia}
                onToggleAddForm={(show) => toggleAddForm('diligencia', show)}
                newValue={newValues.diligencia}
                onNewValueChange={(e) => handleNewValueChange('diligencia', e.target.value)}
                onAddNew={() => handleAddNewValue('diligencia')}
                placeholder="diligência"
                loading={loading}
              />
              <SelectWithAdd
                label="Local de Tramitação *"
                stateKey="local_tramitacao_id"
                value={formData.local_tramitacao_id}
                onChange={handleChange}
                options={localTramitacoes}
                showAddForm={showAddForms.localTramitacao}
                onToggleAddForm={(show) => toggleAddForm('localTramitacao', show)}
                newValue={newValues.localTramitacao}
                onNewValueChange={(e) => handleNewValueChange('localTramitacao', e.target.value)}
                onAddNew={() => handleAddNewValue('localTramitacao')}
                placeholder="local de tramitação"
                loading={loading}
              />
            </div>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 rounded-b-lg">
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all flex items-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Salvando...
                </>
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