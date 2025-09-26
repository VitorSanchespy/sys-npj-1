/**
 * Testes unitários para AgendamentoEmailTemplateService
 */

const AgendamentoEmailTemplateService = require('../../../../services/agendamento/AgendamentoEmailTemplateService');
const { AGENDAMENTO_STATUS, CONVIDADO_STATUS, AGENDAMENTO_TIPOS } = require('../../../../config/agendamento/constants');

describe('AgendamentoEmailTemplateService', () => {

  const mockAgendamento = {
    id: 1,
    titulo: 'Reunião de Planejamento',
    descricao: 'Reunião para discutir o planejamento do próximo semestre',
    tipo: AGENDAMENTO_TIPOS.REUNIAO,
    data_hora: new Date('2024-12-15T14:30:00Z'),
    data_convite: new Date('2024-12-14T14:30:00Z'),
    local: 'Sala de Reuniões 1',
    observacoes: 'Trazer relatórios do semestre anterior',
    status: AGENDAMENTO_STATUS.PENDENTE,
    convidados: JSON.stringify([
      { email: 'user1@example.com', nome: 'João Silva', status: CONVIDADO_STATUS.ACEITO },
      { email: 'user2@example.com', nome: 'Maria Santos', status: CONVIDADO_STATUS.PENDENTE }
    ])
  };

  const mockConvidado = {
    email: 'user1@example.com',
    nome: 'João Silva',
    status: CONVIDADO_STATUS.PENDENTE
  };

  const mockOrganizador = {
    id: 1,
    nome: 'Dr. Coordenador',
    email: 'coord@example.com'
  };

  describe('generateConviteTemplate', () => {
    test('deve gerar template de convite completo', () => {
      const linkResposta = 'https://sistema.com/responder/123';
      const template = AgendamentoEmailTemplateService.generateConviteTemplate(
        mockAgendamento, 
        mockConvidado, 
        linkResposta
      );

      expect(template.subject).toContain('Convite: Reunião de Planejamento');
      expect(template.html).toContain('João Silva');
      expect(template.html).toContain('Reunião de Planejamento');
      expect(template.html).toContain('Sala de Reuniões 1');
      expect(template.html).toContain(linkResposta);
      expect(template.text).toContain('CONVITE PARA REUNIÃO');
      expect(template.text).toContain(linkResposta);
    });

    test('deve gerar template sem nome do convidado', () => {
      const convidadoSemNome = { ...mockConvidado, nome: null };
      const template = AgendamentoEmailTemplateService.generateConviteTemplate(
        mockAgendamento, 
        convidadoSemNome, 
        'https://test.com'
      );

      expect(template.html).toContain('Olá,');
      expect(template.html).not.toContain('Olá, null');
      expect(template.text).toContain('Olá,');
    });

    test('deve gerar template sem campos opcionais', () => {
      const agendamentoMinimo = {
        ...mockAgendamento,
        descricao: null,
        local: null,
        observacoes: null
      };

      const template = AgendamentoEmailTemplateService.generateConviteTemplate(
        agendamentoMinimo, 
        mockConvidado, 
        'https://test.com'
      );

      expect(template.html).not.toContain('Descrição:');
      expect(template.html).not.toContain('Local:');
      expect(template.html).not.toContain('Observações:');
    });

    test('deve incluir botões de aceitar e recusar', () => {
      const template = AgendamentoEmailTemplateService.generateConviteTemplate(
        mockAgendamento, 
        mockConvidado, 
        'https://test.com/responder'
      );

      expect(template.html).toContain('responder&resposta=aceito');
      expect(template.html).toContain('responder&resposta=recusado');
      expect(template.html).toContain('btn-aceitar');
      expect(template.html).toContain('btn-recusar');
    });
  });

  describe('generateLembreteTemplate', () => {
    test('deve gerar lembrete de 24 horas', () => {
      const template = AgendamentoEmailTemplateService.generateLembreteTemplate(
        mockAgendamento, 
        mockConvidado, 
        '24h'
      );

      expect(template.subject).toContain('Lembrete: Agendamento em 24 horas');
      expect(template.html).toContain('Lembrete: Agendamento em 24 horas');
      expect(template.html).toContain('Dicas de Preparação');
    });

    test('deve gerar lembrete de 1 hora', () => {
      const template = AgendamentoEmailTemplateService.generateLembreteTemplate(
        mockAgendamento, 
        mockConvidado, 
        '1h'
      );

      expect(template.subject).toContain('Lembrete: Agendamento em 1 hora');
      expect(template.html).toContain('Últimos preparativos');
    });

    test('deve gerar lembrete final', () => {
      const template = AgendamentoEmailTemplateService.generateLembreteTemplate(
        mockAgendamento, 
        mockConvidado, 
        'final'
      );

      expect(template.subject).toContain('Lembrete Final: Agendamento hoje');
      expect(template.html).toContain('Checklist Final');
    });

    test('deve mostrar status do convidado', () => {
      const convidadoAceito = { ...mockConvidado, status: CONVIDADO_STATUS.ACEITO };
      const template = AgendamentoEmailTemplateService.generateLembreteTemplate(
        mockAgendamento, 
        convidadoAceito, 
        '24h'
      );

      expect(template.html).toContain('status-aceito');
      expect(template.html).toContain('✓ Confirmado');
    });

    test('deve usar lembrete padrão de 24h se tipo não especificado', () => {
      const template = AgendamentoEmailTemplateService.generateLembreteTemplate(
        mockAgendamento, 
        mockConvidado
      );

      expect(template.subject).toContain('Lembrete: Agendamento em 24 horas');
    });
  });

  describe('generateConfirmacaoTemplate', () => {
    test('deve gerar confirmação de aceitação', () => {
      const template = AgendamentoEmailTemplateService.generateConfirmacaoTemplate(
        mockAgendamento, 
        mockConvidado, 
        'aceito'
      );

      expect(template.subject).toContain('Participação confirmada');
      expect(template.html).toContain('Participação Confirmada');
      expect(template.html).toContain('background: #10b981'); // Verde
      expect(template.html).toContain('✓ Confirmada');
      expect(template.html).toContain('Esperamos você no agendamento');
    });

    test('deve gerar confirmação de recusa', () => {
      const template = AgendamentoEmailTemplateService.generateConfirmacaoTemplate(
        mockAgendamento, 
        mockConvidado, 
        'recusado'
      );

      expect(template.subject).toContain('Participação recusada');
      expect(template.html).toContain('Participação Recusada');
      expect(template.html).toContain('background: #ef4444'); // Vermelho
      expect(template.html).toContain('✗ Recusada');
      expect(template.html).toContain('Sua resposta foi registrada');
    });

    test('deve incluir justificativa quando fornecida', () => {
      const convidadoComJustificativa = { 
        ...mockConvidado, 
        justificativa: 'Conflito de horário' 
      };

      const template = AgendamentoEmailTemplateService.generateConfirmacaoTemplate(
        mockAgendamento, 
        convidadoComJustificativa, 
        'recusado'
      );

      expect(template.html).toContain('Justificativa:');
      expect(template.html).toContain('Conflito de horário');
      expect(template.text).toContain('Justificativa: Conflito de horário');
    });
  });

  describe('generateNotificacaoOrganizadorTemplate', () => {
    test('deve gerar notificação de resposta recebida', () => {
      const dadosAdicionais = {
        convidado: mockConvidado,
        resposta: 'aceito'
      };

      const template = AgendamentoEmailTemplateService.generateNotificacaoOrganizadorTemplate(
        mockAgendamento, 
        mockOrganizador, 
        'resposta_recebida', 
        dadosAdicionais
      );

      expect(template.subject).toContain('Nova resposta');
      expect(template.html).toContain('João Silva aceitou o convite');
      expect(template.html).toContain('stats-grid');
    });

    test('deve gerar notificação de todas respostas recebidas', () => {
      const template = AgendamentoEmailTemplateService.generateNotificacaoOrganizadorTemplate(
        mockAgendamento, 
        mockOrganizador, 
        'todas_respostas_recebidas'
      );

      expect(template.subject).toContain('Todas as respostas recebidas');
      expect(template.html).toContain('Todos os convidados responderam ao agendamento');
    });

    test('deve gerar notificação de convites expirados', () => {
      const template = AgendamentoEmailTemplateService.generateNotificacaoOrganizadorTemplate(
        mockAgendamento, 
        mockOrganizador, 
        'convites_expirados'
      );

      expect(template.subject).toContain('Convites expirados');
      expect(template.html).toContain('convites para este agendamento expiraram');
    });

    test('deve mostrar estatísticas dos convidados', () => {
      const template = AgendamentoEmailTemplateService.generateNotificacaoOrganizadorTemplate(
        mockAgendamento, 
        mockOrganizador, 
        'lembrete_agendamento'
      );

      expect(template.html).toContain('stat-number');
      expect(template.html).toContain('Total Convidados');
      expect(template.html).toContain('Aceitos');
      expect(template.html).toContain('Pendentes');
    });

    test('deve usar template genérico para tipo desconhecido', () => {
      const template = AgendamentoEmailTemplateService.generateNotificacaoOrganizadorTemplate(
        mockAgendamento, 
        mockOrganizador, 
        'tipo_inexistente'
      );

      expect(template.subject).toContain('Notificação:');
      expect(template.html).toContain('Notificação sobre o agendamento');
    });
  });

  describe('generateCancelamentoTemplate', () => {
    test('deve gerar template de cancelamento', () => {
      const motivo = 'Conflito de agenda do organizador';
      const template = AgendamentoEmailTemplateService.generateCancelamentoTemplate(
        mockAgendamento, 
        mockConvidado, 
        motivo
      );

      expect(template.subject).toContain('Cancelamento:');
      expect(template.html).toContain('Agendamento Cancelado');
      expect(template.html).toContain('foi <strong>cancelado</strong>');
      expect(template.html).toContain(motivo);
      expect(template.html).toContain('background: #dc2626'); // Vermelho
    });

    test('deve gerar template sem motivo', () => {
      const template = AgendamentoEmailTemplateService.generateCancelamentoTemplate(
        mockAgendamento, 
        mockConvidado, 
        null
      );

      expect(template.html).not.toContain('Motivo do cancelamento:');
      expect(template.text).not.toContain('Motivo do cancelamento:');
    });

    test('deve incluir pedido de desculpas', () => {
      const template = AgendamentoEmailTemplateService.generateCancelamentoTemplate(
        mockAgendamento, 
        mockConvidado, 
        'Motivo técnico'
      );

      expect(template.html).toContain('Pedimos desculpas');
      expect(template.text).toContain('Pedimos desculpas');
    });
  });

  describe('Métodos auxiliares', () => {
    describe('formatDate', () => {
      test('deve formatar data corretamente', () => {
        const data = new Date('2024-12-15T14:30:00Z');
        const resultado = AgendamentoEmailTemplateService.formatDate(data);
        
        expect(resultado).toContain('2024');
        expect(typeof resultado).toBe('string');
      });

      test('deve aceitar string de data', () => {
        const resultado = AgendamentoEmailTemplateService.formatDate('2024-12-15');
        expect(typeof resultado).toBe('string');
      });
    });

    describe('formatTime', () => {
      test('deve formatar hora corretamente', () => {
        const data = new Date('2024-12-15T14:30:00Z');
        const resultado = AgendamentoEmailTemplateService.formatTime(data);
        
        expect(resultado).toMatch(/\d{2}:\d{2}/);
      });
    });

    describe('formatTipo', () => {
      test('deve formatar tipos conhecidos', () => {
        expect(AgendamentoEmailTemplateService.formatTipo(AGENDAMENTO_TIPOS.REUNIAO)).toBe('reunião');
        expect(AgendamentoEmailTemplateService.formatTipo(AGENDAMENTO_TIPOS.AUDIENCIA)).toBe('audiência');
        expect(AgendamentoEmailTemplateService.formatTipo(AGENDAMENTO_TIPOS.PRAZO)).toBe('prazo');
        expect(AgendamentoEmailTemplateService.formatTipo(AGENDAMENTO_TIPOS.OUTRO)).toBe('agendamento');
      });

      test('deve retornar padrão para tipo desconhecido', () => {
        expect(AgendamentoEmailTemplateService.formatTipo('tipo_inexistente')).toBe('agendamento');
      });
    });

    describe('formatStatus', () => {
      test('deve formatar status conhecido', () => {
        expect(AgendamentoEmailTemplateService.formatStatus(AGENDAMENTO_STATUS.PENDENTE)).toBe('Pendente');
        expect(AgendamentoEmailTemplateService.formatStatus(AGENDAMENTO_STATUS.MARCADO)).toBe('Marcado');
        expect(AgendamentoEmailTemplateService.formatStatus(AGENDAMENTO_STATUS.CANCELADO)).toBe('Cancelado');
      });

      test('deve retornar original para status desconhecido', () => {
        expect(AgendamentoEmailTemplateService.formatStatus('status_custom')).toBe('status_custom');
      });
    });

    describe('addHours', () => {
      test('deve adicionar horas corretamente', () => {
        const data = new Date('2024-12-15T14:30:00Z');
        const resultado = AgendamentoEmailTemplateService.addHours(data, 24);
        
        expect(resultado.getTime()).toBe(data.getTime() + (24 * 60 * 60 * 1000));
      });

      test('deve aceitar string de data', () => {
        const resultado = AgendamentoEmailTemplateService.addHours('2024-12-15T14:30:00Z', 1);
        expect(resultado).toBeInstanceOf(Date);
      });
    });

    describe('getBaseStyles', () => {
      test('deve retornar CSS válido', () => {
        const styles = AgendamentoEmailTemplateService.getBaseStyles();
        
        expect(styles).toContain('body');
        expect(styles).toContain('font-family');
        expect(styles).toContain('color');
        expect(typeof styles).toBe('string');
      });
    });

    describe('getPreparationTips', () => {
      test('deve retornar dicas para cada tipo de lembrete', () => {
        const tips24h = AgendamentoEmailTemplateService.getPreparationTips('24h');
        const tips1h = AgendamentoEmailTemplateService.getPreparationTips('1h');
        const tipsFinal = AgendamentoEmailTemplateService.getPreparationTips('final');
        
        expect(tips24h).toContain('Dicas de Preparação');
        expect(tips1h).toContain('Últimos preparativos');
        expect(tipsFinal).toContain('Checklist Final');
      });

      test('deve retornar string vazia para tipo desconhecido', () => {
        const tips = AgendamentoEmailTemplateService.getPreparationTips('inexistente');
        expect(tips).toBe('');
      });
    });

    describe('getEmailFooter', () => {
      test('deve retornar rodapé com ano atual', () => {
        const footer = AgendamentoEmailTemplateService.getEmailFooter();
        const anoAtual = new Date().getFullYear();
        
        expect(footer).toContain(anoAtual.toString());
        expect(footer).toContain('Sistema NPJ');
        expect(footer).toContain('email automático');
      });
    });
  });

  describe('Validação de estrutura dos templates', () => {
    test('todos os templates devem ter subject, html e text', () => {
      const templates = [
        AgendamentoEmailTemplateService.generateConviteTemplate(mockAgendamento, mockConvidado, 'https://test.com'),
        AgendamentoEmailTemplateService.generateLembreteTemplate(mockAgendamento, mockConvidado, '24h'),
        AgendamentoEmailTemplateService.generateConfirmacaoTemplate(mockAgendamento, mockConvidado, 'aceito'),
        AgendamentoEmailTemplateService.generateNotificacaoOrganizadorTemplate(mockAgendamento, mockOrganizador, 'resposta_recebida'),
        AgendamentoEmailTemplateService.generateCancelamentoTemplate(mockAgendamento, mockConvidado, 'Motivo teste')
      ];

      templates.forEach(template => {
        expect(template).toHaveProperty('subject');
        expect(template).toHaveProperty('html');
        expect(template).toHaveProperty('text');
        expect(typeof template.subject).toBe('string');
        expect(typeof template.html).toBe('string');
        expect(typeof template.text).toBe('string');
        expect(template.subject.length).toBeGreaterThan(0);
        expect(template.html.length).toBeGreaterThan(0);
        expect(template.text.length).toBeGreaterThan(0);
      });
    });

    test('templates HTML devem conter estrutura básica', () => {
      const template = AgendamentoEmailTemplateService.generateConviteTemplate(
        mockAgendamento, 
        mockConvidado, 
        'https://test.com'
      );

      expect(template.html).toContain('<!DOCTYPE html>');
      expect(template.html).toContain('<html lang="pt-BR">');
      expect(template.html).toContain('<head>');
      expect(template.html).toContain('<body>');
      expect(template.html).toContain('</html>');
    });

    test('templates devem incluir conteúdo dinâmico básico', () => {
      const agendamentoCustom = {
        ...mockAgendamento,
        titulo: 'Título Personalizado Test',
        descricao: 'Descrição personalizada para teste'
      };

      const template = AgendamentoEmailTemplateService.generateConviteTemplate(
        agendamentoCustom, 
        mockConvidado, 
        'https://test.com'
      );

      // Deve conter o conteúdo personalizado
      expect(template.html).toContain('Título Personalizado Test');
      expect(template.html).toContain('Descrição personalizada para teste');
      expect(template.text).toContain('Título Personalizado Test');
      expect(template.text).toContain('Descrição personalizada para teste');
    });
  });
});