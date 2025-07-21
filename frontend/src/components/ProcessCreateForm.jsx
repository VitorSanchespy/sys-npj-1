import React, { useState } from 'react';
import { processService } from '../api/services';
import { useAuthContext } from '../contexts/AuthContext';

const ProcessCreateForm = () => {
  const { token } = useAuthContext();
  const [formData, setFormData] = useState({
    numero_processo: '',
    titulo: '',
    data_abertura: '',
    descricao: '',
    materia_assunto_id: '',
    fase_id: '',
    contato_assistido: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await processService.createProcess(formData, token);
      setSuccess(true);
      setFormData({ 
        numero_processo: '',
        titulo: '',
        data_abertura: '',
        descricao: '',
        materia_assunto_id: '',
        fase_id: '',
        contato_assistido: ''
      });
      console.log('Processo criado:', response);
    } catch (err) {
      setError('Erro ao criar processo. Tente novamente.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-white shadow-md rounded-md">
      <h2 className="text-xl font-bold mb-4">Criar Processo</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="numero_processo" className="block text-sm font-medium text-gray-700">
            Número do Processo
          </label>
          <input
            type="text"
            id="numero_processo"
            name="numero_processo"
            value={formData.numero_processo}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="titulo" className="block text-sm font-medium text-gray-700">
            Título
          </label>
          <input
            type="text"
            id="titulo"
            name="titulo"
            value={formData.titulo}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="data_abertura" className="block text-sm font-medium text-gray-700">
            Data de Abertura
          </label>
          <input
            type="date"
            id="data_abertura"
            name="data_abertura"
            value={formData.data_abertura}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="descricao" className="block text-sm font-medium text-gray-700">
            Descrição
          </label>
          <textarea
            id="descricao"
            name="descricao"
            value={formData.descricao}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
          ></textarea>
        </div>
        <div className="mb-4">
          <label htmlFor="contato_assistido" className="block text-sm font-medium text-gray-700">
            Contato do Assistido
          </label>
          <input
            type="text"
            id="contato_assistido"
            name="contato_assistido"
            value={formData.contato_assistido}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        {success && <p className="text-green-500 text-sm mb-4">Processo criado com sucesso!</p>}
        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          disabled={loading}
        >
          {loading ? 'Criando...' : 'Criar Processo'}
        </button>
      </form>
    </div>
  );
};

export default ProcessCreateForm;
