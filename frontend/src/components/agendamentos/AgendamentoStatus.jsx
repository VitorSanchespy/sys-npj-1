import React from 'react';

const AgendamentoStatus = ({ status, convidados = [], dataConvitesEnviados = null, className = '' }) => {
  
  const getStatusInfo = () => {
    switch (status) {
      case 'em_analise':
        return {
          text: 'Em Análise',
          icon: '⏳',
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          description: 'Aguardando aprovação de Admin/Professor'
        };
      case 'aprovado':
        return {
          text: 'Aprovado',
          icon: '✅',
          color: 'bg-green-100 text-green-800 border-green-200',
          description: 'Aprovado e pronto para execução'
        };
      case 'recusado':
        return {
          text: 'Recusado',
          icon: '❌',
          color: 'bg-red-100 text-red-800 border-red-200',
          description: 'Recusado por Admin/Professor'
        };
      case 'cancelado':
        return {
          text: 'Cancelado',
          icon: '🗑️',
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          description: 'Agendamento foi cancelado'
        };
      case 'pendente':
        return {
          text: 'Pendente',
          icon: '📧',
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          description: 'Convites enviados - aguardando respostas'
        };
      case 'enviando_convites':
        return {
          text: 'Enviando Convites',
          icon: '📤',
          color: 'bg-purple-100 text-purple-800 border-purple-200',
          description: 'Processando envio de convites'
        };
      case 'agendado':
      case 'marcado':
        return {
          text: 'Agendado',
          icon: '📅',
          color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
          description: 'Confirmado e agendado'
        };
      case 'concluido':
      case 'finalizado':
        return {
          text: 'Concluído',
          icon: '✅',
          color: 'bg-green-100 text-green-800 border-green-200',
          description: 'Agendamento realizado'
        };
      default:
        return {
          text: status || 'Desconhecido',
          icon: '❓',
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          description: 'Status não identificado'
        };
    }
  };

  const getConvidadosInfo = () => {
    if (!convidados || convidados.length === 0) {
      return null;
    }

    const aceitos = convidados.filter(c => c.status === 'aceito').length;
    const recusados = convidados.filter(c => c.status === 'recusado').length;
    const pendentes = convidados.filter(c => c.status === 'pendente').length;
    const total = convidados.length;

    return {
      total,
      aceitos,
      recusados,
      pendentes,
      porcentagemResposta: Math.round(((aceitos + recusados) / total) * 100)
    };
  };

  const getTempoRestanteConvites = () => {
    if (!dataConvitesEnviados || status !== 'pendente') {
      return null;
    }

    const agora = new Date();
    const dataEnvio = new Date(dataConvitesEnviados);
    const horasPassadas = (agora - dataEnvio) / (1000 * 60 * 60);
    const horasRestantes = Math.max(0, 24 - horasPassadas);

    if (horasRestantes <= 0) {
      return { expirado: true };
    }

    return {
      expirado: false,
      horas: Math.floor(horasRestantes),
      minutos: Math.floor((horasRestantes % 1) * 60),
      urgente: horasRestantes < 2,
      aviso: horasRestantes < 6
    };
  };

  const statusInfo = getStatusInfo();
  const convidadosInfo = getConvidadosInfo();
  const tempoRestante = getTempoRestanteConvites();

  return (
    <div className={`inline-block ${className}`}>
      {/* Status principal */}
      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${statusInfo.color}`}>
        <span className="mr-2">{statusInfo.icon}</span>
        <span>{statusInfo.text}</span>
      </div>

      {/* Informações adicionais de convites */}
      {convidadosInfo && (
        <div className="mt-2 text-xs text-gray-600">
          <div className="flex items-center space-x-4">
            <span>👥 {convidadosInfo.total} convidado{convidadosInfo.total !== 1 ? 's' : ''}</span>
            {convidadosInfo.aceitos > 0 && (
              <span className="text-green-600">✅ {convidadosInfo.aceitos}</span>
            )}
            {convidadosInfo.recusados > 0 && (
              <span className="text-red-600">❌ {convidadosInfo.recusados}</span>
            )}
            {convidadosInfo.pendentes > 0 && (
              <span className="text-yellow-600">⏳ {convidadosInfo.pendentes}</span>
            )}
            <span className="text-gray-500">
              ({convidadosInfo.porcentagemResposta}% responderam)
            </span>
          </div>
        </div>
      )}

      {/* Tempo restante para convites */}
      {tempoRestante && (
        <div className="mt-2">
          {tempoRestante.expirado ? (
            <div className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
              ⏰ Convites expiraram - aceitos automaticamente
            </div>
          ) : (
            <div className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
              tempoRestante.urgente ? 'bg-red-100 text-red-800' :
              tempoRestante.aviso ? 'bg-yellow-100 text-yellow-800' :
              'bg-blue-100 text-blue-800'
            }`}>
              ⏱️ Restam {tempoRestante.horas}h {tempoRestante.minutos}min
              {tempoRestante.urgente && ' - URGENTE!'}
            </div>
          )}
        </div>
      )}

      {/* Descrição do status */}
      <div className="mt-1 text-xs text-gray-500">
        {statusInfo.description}
      </div>
    </div>
  );
};

export default AgendamentoStatus;
