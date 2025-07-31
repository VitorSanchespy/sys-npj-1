import React from 'react';
import AgendamentoManager from '../components/AgendamentoManager';

const AgendamentosPage = () => {
  return (
    <>
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ 
          margin: 0, 
          fontSize: '24px', 
          fontWeight: '600',
          color: '#343a40'
        }}>
          📅 Agendamentos
        </h1>
        <p style={{ 
          margin: '8px 0 0 0', 
          fontSize: '14px', 
          color: '#6c757d' 
        }}>
          Gerencie seus compromissos, prazos e audiências.
        </p>
      </div>
      <AgendamentoManager />
    </>
  );
};

export default AgendamentosPage;
