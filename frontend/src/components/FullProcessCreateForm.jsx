import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthContext } from '@/contexts/AuthContext';

const FullProcessCreateForm = () => {
  const { token, user } = useAuthContext();
  const [formData, setFormData] = useState({
    numero_processo: '',
    num_processo_sei: '',
    assistido: '',
    descricao: '',
    status: '',
    materia_assunto_id: '',
    local_tramitacao_id: '',
    sistema: '',
    fase_id: '',
    diligencia_id: '',
  });
  const [materias, setMaterias] = useState([]);
  const [fases, setFases] = useState([]);
  const [diligencias, setDiligencias] = useState([]);
  const [localTramitacoes, setLocalTramitacoes] = useState([]);
  const [contatoAssistido, setContatoAssistido] = useState('');
  const [newMateriaAssunto, setNewMateriaAssunto] = useState('');
  const [newLocalTramitacao, setNewLocalTramitacao] = useState('');
  const [newFase, setNewFase] = useState('');
  const [newDiligencia, setNewDiligencia] = useState('');
  const [showNewValueField, setShowNewValueField] = useState({
    materiaAssunto: false,
    localTramitacao: false,
    fase: false,
    diligencia: false,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Iniciando chamadas à API para dados auxiliares');
        if (!token) {
          throw new Error('Token de autenticação não encontrado. Certifique-se de que o usuário está logado.');
        }

        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        const [materiasRes, fasesRes, diligenciasRes, localTramitacoesRes] = await Promise.all([
          axios.get('/api/aux/materia-assunto', config),
          axios.get('/api/aux/fase', config),
          axios.get('/api/aux/diligencia', config),
          axios.get('/api/aux/local-tramitacao', config),
        ]);
        console.log('Dados recebidos:', { materias: materiasRes.data, fases: fasesRes.data, diligencias: diligenciasRes.data, localTramitacoes: localTramitacoesRes.data });
        setMaterias(materiasRes.data);
        setFases(fasesRes.data);
        setDiligencias(diligenciasRes.data);
        setLocalTramitacoes(localTramitacoesRes.data);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        alert(`Erro ao carregar dados auxiliares: ${error.message}`);
      }
    };
    fetchData();
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAddNewValue = async (field, value) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.post(`/api/aux/${field}`, { nome: value }, config);
      alert(`${field} adicionado com sucesso!`);

      // Re-fetch data after adding a new value
      const [materiasRes, fasesRes, diligenciasRes, localTramitacoesRes] = await Promise.all([
        axios.get('/api/aux/materia-assunto', config),
        axios.get('/api/aux/fase', config),
        axios.get('/api/aux/diligencia', config),
        axios.get('/api/aux/local-tramitacao', config),
      ]);
      setMaterias(materiasRes.data);
      setFases(fasesRes.data);
      setDiligencias(diligenciasRes.data);
      setLocalTramitacoes(localTramitacoesRes.data);

      // Automatically select the newly added value
      if (field === 'materia-assunto') {
        setFormData({ ...formData, materia_assunto_id: response.data.id });
      } else if (field === 'local-tramitacao') {
        setFormData({ ...formData, local_tramitacao_id: response.data.id });
      } else if (field === 'fase') {
        setFormData({ ...formData, fase_id: response.data.id });
      } else if (field === 'diligencia') {
        setFormData({ ...formData, diligencia_id: response.data.id });
      }

      // Hide the input field
      setShowNewValueField({ ...showNewValueField, [field]: false });
    } catch (error) {
      console.error(`Erro ao adicionar novo valor em ${field}:`, error);
      alert(`Erro ao adicionar novo valor: ${error.message}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const userId = user?.id || null; // Obtém o ID do usuário a partir do contexto de autenticação
      const response = await axios.post('http://localhost:3001/api/processos/novo', { ...formData, contato_assistido: contatoAssistido, idusuario_responsavel: userId }, config);
      alert('Processo criado com sucesso!');
    } catch (error) {
      console.error('Erro ao criar processo:',  error, error.response?.data);
      alert(`Erro ao criar processo: ${error.response?.data?.message || error.message}`);
    }
  };

  return (
    <div className="bg-gray-100 p-6 rounded-lg shadow-lg">
      <h3 className="text-xl font-semibold mb-6 text-gray-800">Novo Processo</h3>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Número do Processo</label>
          <input
            type="text"
            name="numero_processo"
            value={formData.numero_processo}
            onChange={handleChange}
            className="mt-2 block w-full border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Num/Processo/Sei</label>
          <input
            type="text"
            name="num_processo_sei"
            value={formData.num_processo_sei}
            onChange={handleChange}
            className="mt-2 block w-full border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Assistido/a</label>
          <input
            type="text"
            name="assistido"
            value={formData.assistido}
            onChange={handleChange}
            className="mt-2 block w-full border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Contato/Assistido</label>
          <input
            type="text"
            name="contatoAssistido"
            value={contatoAssistido}
            onChange={(e) => setContatoAssistido(e.target.value)}
            className="mt-2 block w-full border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Descrição</label>
          <textarea
            name="descricao"
            value={formData.descricao}
            onChange={handleChange}
            className="mt-2 block w-full border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2"
            required
          ></textarea>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="mt-2 block w-full border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2"
            required
          >
            <option value="">Selecione o status</option>
            <option value="Em andamento">Em andamento</option>
            <option value="Concluído">Concluído</option>
            <option value="Suspenso">Suspenso</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Matéria/Assunto</label>
          <select
            name="materia_assunto_id"
            value={formData.materia_assunto_id}
            onChange={handleChange}
            className="mt-2 block w-full border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2"
            required
          >
            <option value="">Selecione a matéria/assunto</option>
            {materias.map((materia) => (
              <option key={materia.id} value={materia.id}>
                {materia.nome}
              </option>
            ))}
          </select>
          {!showNewValueField.materiaAssunto && (
            <button
              type="button"
              onClick={() => setShowNewValueField({ ...showNewValueField, materiaAssunto: true })}
              className="mt-2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Adicionar novo valor
            </button>
          )}
          {showNewValueField.materiaAssunto && (
            <div>
              <input
                type="text"
                placeholder="Adicionar novo Matéria/Assunto"
                value={newMateriaAssunto}
                onChange={(e) => setNewMateriaAssunto(e.target.value)}
                className="mt-2 block w-full border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2"
              />
              <button
                type="button"
                onClick={() => handleAddNewValue('materia-assunto', newMateriaAssunto)}
                className="mt-2 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                Adicionar
              </button>
            </div>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Local de Tramitação</label>
          <select
            name="local_tramitacao"
            value={formData.local_tramitacao_id}
            onChange={handleChange}
            className="mt-2 block w-full border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2"
            required
          >
            <option value="">Selecione o local de tramitação</option>
            {localTramitacoes.map((local) => (
              <option key={local.id} value={local.id}>
                {local.nome}
              </option>
            ))}
          </select>
          {!showNewValueField.localTramitacao && (
            <button
              type="button"
              onClick={() => setShowNewValueField({ ...showNewValueField, localTramitacao: true })}
              className="mt-2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Adicionar novo valor
            </button>
          )}
          {showNewValueField.localTramitacao && (
            <div>
              <input
                type="text"
                placeholder="Adicionar novo Local de Tramitação"
                value={newLocalTramitacao}
                onChange={(e) => setNewLocalTramitacao(e.target.value)}
                className="mt-2 block w-full border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2"
              />
              <button
                type="button"
                onClick={() => handleAddNewValue('local-tramitacao', newLocalTramitacao)}
                className="mt-2 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                Adicionar
              </button>
            </div>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Sistema</label>
          <select
            name="sistema"
            value={formData.sistema}
            onChange={handleChange}
            className="mt-2 block w-full border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2"
            required
          >
            <option value="">Selecione o sistema</option>
            <option value="Físico">Físico</option>
            <option value="PEA">PEA</option>
            <option value="PJE">PJE</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Fase</label>
          <select
            name="fase_id"
            value={formData.fase_id}
            onChange={handleChange}
            className="mt-2 block w-full border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2"
            required
          >
            <option value="">Selecione a fase</option>
            {fases.map((fase) => (
              <option key={fase.id} value={fase.id}>
                {fase.nome}
              </option>
            ))}
          </select>
          {!showNewValueField.fase && (
            <button
              type="button"
              onClick={() => setShowNewValueField({ ...showNewValueField, fase: true })}
              className="mt-2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Adicionar novo valor
            </button>
          )}
          {showNewValueField.fase && (
            <div>
              <input
                type="text"
                placeholder="Adicionar nova Fase"
                value={newFase}
                onChange={(e) => setNewFase(e.target.value)}
                className="mt-2 block w-full border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2"
              />
              <button
                type="button"
                onClick={() => handleAddNewValue('fase', newFase)}
                className="mt-2 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                Adicionar
              </button>
            </div>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Diligência</label>
          <select
            name="diligencia_id"
            value={formData.diligencia_id}
            onChange={handleChange}
            className="mt-2 block w-full border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2"
            required
          >
            <option value="">Selecione a diligência</option>
            {diligencias.map((diligencia) => (
              <option key={diligencia.id} value={diligencia.id}>
                {diligencia.nome}
              </option>
            ))}
          </select>
          {!showNewValueField.diligencia && (
            <button
              type="button"
              onClick={() => setShowNewValueField({ ...showNewValueField, diligencia: true })}
              className="mt-2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Adicionar novo valor
            </button>
          )}
          {showNewValueField.diligencia && (
            <div>
              <input
                type="text"
                placeholder="Adicionar nova Diligência"
                value={newDiligencia}
                onChange={(e) => setNewDiligencia(e.target.value)}
                className="mt-2 block w-full border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2"
              />
              <button
                type="button"
                onClick={() => handleAddNewValue('diligencia', newDiligencia)}
                className="mt-2 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                Adicionar
              </button>
            </div>
          )}
        </div>
        <div className="flex justify-end gap-4">
          <button
            type="submit"
            className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Criar
          </button>
          <button
            type="button"
            className="bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            onClick={() => window.location.href = 'http://localhost:5173/processos/'}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default FullProcessCreateForm;
