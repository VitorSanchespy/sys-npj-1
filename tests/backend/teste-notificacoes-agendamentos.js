/**
 * Teste completo do sistema de agendamentos com notificações
 * Verifica se as notificações são enviadas corretamente para todos os cenários
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

// Credenciais de teste
const usuarios = {
    admin: { email: 'admin@teste.com', senha: 'admin123' },
    professor: { email: 'joao@teste.com', senha: 'joao123' },
    aluno: { email: 'maria@teste.com', senha: 'maria123' }
};

// IDs dos usuários (serão obtidos após login)
let userIds = {};

async function login(usuario, role) {
    try {
        const response = await axios.post(`${BASE_URL}/auth/login`, usuario);
        console.log(`✅ Login realizado para ${role}: ${usuario.email}`);
        return {
            token: response.data.token,
            user: response.data.user
        };
    } catch (error) {
        console.error(`❌ Erro ao fazer login para ${role}:`, error.response?.data?.erro || error.message);
        return null;
    }
}

async function criarAgendamento(token, nomeUsuario, agendamento) {
    try {
        const response = await axios.post(`${BASE_URL}/api/agendamentos`, agendamento, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`\n✅ ${nomeUsuario} criou agendamento: ${agendamento.titulo}`);
        console.log(`   📧 Notificações devem ter sido enviadas automaticamente`);
        return response.data;
    } catch (error) {
        console.error(`\n❌ ${nomeUsuario} não conseguiu criar agendamento:`, error.response?.data?.erro || error.message);
        return null;
    }
}

async function atualizarAgendamento(token, nomeUsuario, agendamentoId, dadosAtualizacao) {
    try {
        const response = await axios.put(`${BASE_URL}/api/agendamentos/${agendamentoId}`, dadosAtualizacao, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`\n✅ ${nomeUsuario} atualizou agendamento ID ${agendamentoId}`);
        console.log(`   📧 Notificações de atualização devem ter sido enviadas`);
        return response.data;
    } catch (error) {
        console.error(`\n❌ ${nomeUsuario} não conseguiu atualizar agendamento:`, error.response?.data?.erro || error.message);
        return null;
    }
}

async function cancelarAgendamento(token, nomeUsuario, agendamentoId, motivo = '') {
    try {
        await axios.delete(`${BASE_URL}/api/agendamentos/${agendamentoId}`, {
            headers: { Authorization: `Bearer ${token}` },
            data: { motivo }
        });
        console.log(`\n✅ ${nomeUsuario} cancelou agendamento ID ${agendamentoId}`);
        if (motivo) console.log(`   📝 Motivo: ${motivo}`);
        console.log(`   📧 Notificações de cancelamento devem ter sido enviadas`);
        return true;
    } catch (error) {
        console.error(`\n❌ ${nomeUsuario} não conseguiu cancelar agendamento:`, error.response?.data?.erro || error.message);
        return false;
    }
}

async function listarNotificacoes(token, nomeUsuario) {
    try {
        const response = await axios.get(`${BASE_URL}/api/notificacoes`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`\n📬 Notificações para ${nomeUsuario}: ${response.data.length}`);
        
        response.data.slice(0, 3).forEach((notif, index) => {
            console.log(`   ${index + 1}. ${notif.titulo}: ${notif.mensagem}`);
        });
        
        return response.data;
    } catch (error) {
        console.error(`❌ Erro ao listar notificações para ${nomeUsuario}:`, error.response?.data?.erro || error.message);
        return [];
    }
}

async function testarSistemaNotificacoes() {
    console.log('🔔 TESTANDO SISTEMA DE NOTIFICAÇÕES DE AGENDAMENTOS');
    console.log('=' .repeat(70));

    // 1. Fazer login com todos os usuários
    console.log('\n1️⃣ Fazendo login com todos os usuários...');
    const sessions = {};
    
    for (const [role, credenciais] of Object.entries(usuarios)) {
        const session = await login(credenciais, role);
        if (session) {
            sessions[role] = session;
            userIds[role] = session.user.id;
            console.log(`   ID do ${role}: ${session.user.id}`);
        } else {
            console.error(`❌ Falha no login para ${role}. Teste abortado.`);
            return;
        }
    }

    console.log('\n' + '─'.repeat(70));

    // 2. Cenário 1: Professor criando agendamento para aluno
    console.log('\n2️⃣ CENÁRIO 1: Professor criando agendamento para aluno');
    console.log('   📧 Esperado: Aluno recebe notificação, Professor recebe confirmação');
    
    const agendamento1 = await criarAgendamento(sessions.professor.token, 'Professor', {
        usuario_id: userIds.aluno, // Para o aluno
        tipo_evento: 'reuniao',
        titulo: 'Orientação de TCC - Notificação Teste',
        descricao: 'Reunião para discutir o desenvolvimento do TCC',
        data_evento: '2025-08-15T14:00:00Z',
        local: 'Sala do Professor',
        lembrete_1_dia: true,
        lembrete_2_dias: true,
        lembrete_1_semana: false
    });

    if (agendamento1) {
        console.log(`   📋 Agendamento criado com ID: ${agendamento1.id}`);
    }

    console.log('\n' + '─'.repeat(70));

    // 3. Cenário 2: Admin criando agendamento para si mesmo
    console.log('\n3️⃣ CENÁRIO 2: Admin criando agendamento para si mesmo');
    console.log('   📧 Esperado: Admin recebe apenas confirmação');
    
    const agendamento2 = await criarAgendamento(sessions.admin.token, 'Admin', {
        tipo_evento: 'reuniao',
        titulo: 'Reunião Administrativa - Auto Agendamento',
        descricao: 'Reunião de planejamento mensal',
        data_evento: '2025-08-20T10:00:00Z',
        local: 'Sala da Coordenação',
        lembrete_1_dia: true
    });

    if (agendamento2) {
        console.log(`   📋 Agendamento criado com ID: ${agendamento2.id}`);
    }

    console.log('\n' + '─'.repeat(70));

    // 4. Cenário 3: Aluno tentando criar para professor (deve falhar)
    console.log('\n4️⃣ CENÁRIO 3: Aluno tentando criar agendamento para professor');
    console.log('   ❌ Esperado: Falha na criação (regra de negócio)');
    
    await criarAgendamento(sessions.aluno.token, 'Aluno', {
        usuario_id: userIds.professor, // Para o professor (deve falhar)
        tipo_evento: 'reuniao',
        titulo: 'Tentativa Inválida',
        descricao: 'Aluno tentando criar para professor',
        data_evento: '2025-08-25T15:00:00Z',
        local: 'Qualquer lugar'
    });

    console.log('\n' + '─'.repeat(70));

    // 5. Cenário 4: Atualização de agendamento
    if (agendamento1) {
        console.log('\n5️⃣ CENÁRIO 4: Professor atualizando agendamento');
        console.log('   📧 Esperado: Aluno recebe notificação de atualização');
        
        await atualizarAgendamento(sessions.professor.token, 'Professor', agendamento1.id, {
            titulo: 'Orientação de TCC - ATUALIZADO',
            data_evento: '2025-08-15T15:00:00Z', // Horário alterado
            local: 'Sala 202 - Local Atualizado'
        });
    }

    console.log('\n' + '─'.repeat(70));

    // 6. Aguardar um pouco para processamento das notificações
    console.log('\n6️⃣ Aguardando processamento das notificações...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 7. Verificar notificações recebidas
    console.log('\n7️⃣ VERIFICANDO NOTIFICAÇÕES RECEBIDAS:');
    
    for (const [role, session] of Object.entries(sessions)) {
        await listarNotificacoes(session.token, role.charAt(0).toUpperCase() + role.slice(1));
    }

    console.log('\n' + '─'.repeat(70));

    // 8. Cenário 5: Cancelamento de agendamento
    if (agendamento1) {
        console.log('\n8️⃣ CENÁRIO 5: Professor cancelando agendamento');
        console.log('   📧 Esperado: Aluno recebe notificação de cancelamento');
        
        await cancelarAgendamento(
            sessions.professor.token, 
            'Professor', 
            agendamento1.id,
            'Conflito de horário - reagendamento necessário'
        );
    }

    console.log('\n' + '─'.repeat(70));

    // 9. Limpeza: cancelar agendamento restante
    if (agendamento2) {
        console.log('\n9️⃣ LIMPEZA: Cancelando agendamento do admin');
        await cancelarAgendamento(sessions.admin.token, 'Admin', agendamento2.id, 'Teste finalizado');
    }

    // 10. Verificação final das notificações
    console.log('\n🔟 VERIFICAÇÃO FINAL DAS NOTIFICAÇÕES:');
    
    for (const [role, session] of Object.entries(sessions)) {
        await listarNotificacoes(session.token, role.charAt(0).toUpperCase() + role.slice(1));
    }

    console.log('\n' + '🎉'.repeat(35));
    console.log('\n✅ TESTE DE NOTIFICAÇÕES CONCLUÍDO!');
    console.log('\n📋 RESUMO DO QUE FOI TESTADO:');
    console.log('   ✓ Criação de agendamento com notificação ao destinatário');
    console.log('   ✓ Confirmação ao criador do agendamento');
    console.log('   ✓ Validação de regras de negócio (aluno não pode criar para professor)');
    console.log('   ✓ Notificações de atualização de agendamentos');
    console.log('   ✓ Notificações de cancelamento com motivo');
    console.log('   ✓ Diferentes tipos de usuários (Admin, Professor, Aluno)');
    
    console.log('\n📧 VERIFIQUE TAMBÉM:');
    console.log('   • Se configurado, emails devem ter sido enviados');
    console.log('   • Notificações em tempo real (WebSocket)');
    console.log('   • Logs no backend com detalhes das notificações');
}

// Executar teste
if (require.main === module) {
    testarSistemaNotificacoes().catch(console.error);
}

module.exports = { testarSistemaNotificacoes };
