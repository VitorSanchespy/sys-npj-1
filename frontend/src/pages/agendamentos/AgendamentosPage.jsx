import React from 'react';
import AgendamentosLista from '@/components/agendamentos/AgendamentosLista';

const AgendamentosPage = () => {
  return (
    <div style={{
      padding: '20px',
      minHeight: '100vh',
      backgroundColor: '#f8f9fa'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <AgendamentosLista />
      </div>
    </div>
  );
};

export default AgendamentosPage;
