import React, { useState } from 'react';
import FullProcessCreateForm from '@/components/FullProcessCreateForm';

const ProcessCreatePage = () => {
  const [isFormVisible, setFormVisible] = useState(true);

  const handleFormToggle = () => {
    setFormVisible(!isFormVisible);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Cadastro de Novo Processo</h1>
      <button
        onClick={handleFormToggle}
        className="mb-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        {isFormVisible ? 'Ocultar Formulário' : 'Exibir Formulário'}
      </button>
      {isFormVisible && <FullProcessCreateForm />}
    </div>
  );
};

export default ProcessCreatePage;
