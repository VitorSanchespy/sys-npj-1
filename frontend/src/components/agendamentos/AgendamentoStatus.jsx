import React from 'react';

const AgendamentoStatus = ({ status, className = '' }) => {
  const getStatusConfig = (status) => {
    switch (status) {
      case 'em_analise':
        return {
          text: 'Em Análise',
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-800',
          icon: '🔍',
          description: 'Aguardando aprovação do responsável'
        };
      case 'enviando_convites':
        return {
          text: 'Enviando Convites',
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-800',
          icon: '📧',
          description: 'Convites foram enviados aos participantes'
        };
      case 'marcado':
        return {
          text: 'Marcado',
          bgColor: 'bg-green-100',
          textColor: 'text-green-800',
          icon: '✅',
          description: 'Agendamento confirmado e marcado'
        };
      case 'cancelado':
        return {
          text: 'Cancelado',
          bgColor: 'bg-red-100',
          textColor: 'text-red-800',
          icon: '❌',
          description: 'Agendamento foi cancelado'
        };
      case 'finalizado':
        return {
          text: 'Finalizado',
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800',
          icon: '🏁',
          description: 'Agendamento concluído'
        };
      default:
        return {
          text: status || 'Indefinido',
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800',
          icon: '❓',
          description: 'Status não reconhecido'
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <div className={`inline-flex items-center ${className}`}>
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor}`}>
        <span className="mr-1">{config.icon}</span>
        {config.text}
      </span>
    </div>
  );
};

export default AgendamentoStatus;
