import React from 'react';
import AgendamentoManager from '../components/AgendamentoManager';

const AgendamentosPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                📅 Agendamentos
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                Gerencie seus compromissos, prazos e audiências.
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <AgendamentoManager />
      </div>
    </div>
  );
};

export default AgendamentosPage;
