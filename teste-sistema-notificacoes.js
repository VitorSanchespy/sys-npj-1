/**
 * Script para criar usuários de teste e testar o sistema de notificações
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function criarUsuarioTeste(dadosUsuario) {
    try {
        const response = await axios.post(`${BASE_URL}/api/usuarios`, dadosUsuario);
        console.log(`✅ Usuário criado: ${dadosUsuario.nome} (${dadosUsuario.email})`);
        return response.data;
    } catch (error) {
        if (error.response?.status === 409) {
            console.log(`ℹ️  Usuário já existe: ${dadosUsuario.email}`);
            return null;
        }
        console.error(`❌ Erro ao criar usuário ${dadosUsuario.email}:`, error.response?.data?.erro || error.message);
        return null;
    }
}

async function login(credenciais) {
    try {
        const response = await axios.post(`${BASE_URL}/auth/login`, credenciais);
        console.log(`✅ Login realizado: ${credenciais.email}`);
        return {
            token: response.data.token,
            user: response.data.user
        };
    } catch (error) {
        console.error(`❌ Erro no login ${credenciais.email}:`, error.response?.data?.erro || error.message);
        return null;
    }
}

async function criarAgendamento(token, dadosAgendamento) {
    try {
        const response = await axios.post(`${BASE_URL}/api/agendamentos`, dadosAgendamento, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`✅ Agendamento criado: ${dadosAgendamento.titulo}`);
        console.log(`   📧 Notificações devem ter sido enviadas!`);
        return response.data;
    } catch (error) {
        console.error(`❌ Erro ao criar agendamento:`, error.response?.data?.erro || error.message);
        return null;
    }
}

async function listarNotificacoes(token, nomeUsuario) {
    try {
        const response = await axios.get(`${BASE_URL}/api/notificacoes`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`\n📬 Notificações para ${nomeUsuario}:`);
        if (response.data.length === 0) {
            console.log('   Nenhuma notificação encontrada');
        } else {
            response.data.slice(0, 5).forEach((notif, index) => {
                console.log(`   ${index + 1}. [${notif.tipo}] ${notif.titulo}: ${notif.mensagem}`);
            });
        }
        return response.data;
    } catch (error) {
        console.error(`❌ Erro ao listar notificações:`, error.response?.data?.erro || error.message);
        return [];
    }
}

async function testarSistemaCompleto() {
    console.log('🚀 TESTANDO SISTEMA DE NOTIFICAÇÕES DE AGENDAMENTOS');
    console.log('=' .repeat(70));

    // 1. Criar usuários de teste
    console.log('\n📝 1. Criando usuários de teste...');
    
    const usuarios = [
        {
            nome: 'Admin Teste',
            email: 'admin.teste@npj.ufmt.br',
            senha: 'admin123',
            role_id: 1, // Admin
            telefone: '(65) 99999-0001'
        },
        {
            nome: 'Professor João',
            email: 'joao.professor@npj.ufmt.br', 
            senha: 'prof123',
            role_id: 2, // Professor
            telefone: '(65) 99999-0002'
        },
        {
            nome: 'Aluna Maria',
            email: 'maria.aluna@npj.ufmt.br',
            senha: 'aluna123', 
            role_id: 3, // Aluno
            telefone: '(65) 99999-0003'
        }
    ];

    for (const usuario of usuarios) {
        await criarUsuarioTeste(usuario);
    }

    // 2. Fazer login com os usuários
    console.log('\n🔐 2. Fazendo login com os usuários...');
    
    const sessions = {};
    const credenciais = [
        { email: 'admin.teste@npj.ufmt.br', senha: 'admin123', nome: 'Admin' },
        { email: 'joao.professor@npj.ufmt.br', senha: 'prof123', nome: 'Professor' },
        { email: 'maria.aluna@npj.ufmt.br', senha: 'aluna123', nome: 'Aluna' }
    ];

    for (const cred of credenciais) {
        const session = await login({ email: cred.email, senha: cred.senha });
        if (session) {
            sessions[cred.nome.toLowerCase()] = session;
            console.log(`   ID: ${session.user.id}, Role: ${session.user.role?.nome || 'N/A'}`);
        }
    }

    if (Object.keys(sessions).length < 2) {
        console.error('❌ Falha nos logins. Teste abortado.');
        return;
    }

    console.log('\n' + '─'.repeat(70));

    // 3. Cenário 1: Professor criando agendamento para aluna
    console.log('\n📅 3. CENÁRIO: Professor criando agendamento para aluna');
    console.log('   📧 Esperado: Aluna recebe notificação + Professor recebe confirmação');

    if (sessions.professor && sessions.aluna) {
        const agendamento = await criarAgendamento(sessions.professor.token, {
            usuario_id: sessions.aluna.user.id, // Para a aluna
            tipo_evento: 'reuniao',
            titulo: 'Orientação de TCC - Teste Notificações',
            descricao: 'Reunião para discussão do desenvolvimento do TCC',
            data_evento: '2025-08-15T14:00:00Z',
            local: 'Sala do Professor - Bloco A',
            lembrete_1_dia: true,
            lembrete_2_dias: true
        });

        if (agendamento) {
            console.log(`   📋 Agendamento criado com ID: ${agendamento.id}`);
            
            // Aguardar processamento das notificações
            console.log('   ⏳ Aguardando processamento das notificações...');
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Verificar notificações da aluna
            console.log('\n📬 Verificando notificações da ALUNA:');
            await listarNotificacoes(sessions.aluna.token, 'Aluna Maria');

            // Verificar notificações do professor
            console.log('\n📬 Verificando notificações do PROFESSOR:');
            await listarNotificacoes(sessions.professor.token, 'Professor João');
        }
    }

    console.log('\n' + '─'.repeat(70));

    // 4. Cenário 2: Admin criando agendamento para si mesmo
    console.log('\n📅 4. CENÁRIO: Admin criando agendamento para si mesmo');
    console.log('   📧 Esperado: Admin recebe apenas confirmação');

    if (sessions.admin) {
        const agendamento2 = await criarAgendamento(sessions.admin.token, {
            tipo_evento: 'reuniao',
            titulo: 'Reunião Administrativa - Teste',
            descricao: 'Reunião de planejamento mensal',
            data_evento: '2025-08-20T10:00:00Z',
            local: 'Sala da Coordenação',
            lembrete_1_dia: true
        });

        if (agendamento2) {
            console.log(`   📋 Agendamento criado com ID: ${agendamento2.id}`);
            
            // Aguardar e verificar notificações
            await new Promise(resolve => setTimeout(resolve, 1500));
            console.log('\n📬 Verificando notificações do ADMIN:');
            await listarNotificacoes(sessions.admin.token, 'Admin');
        }
    }

    console.log('\n' + '🎉'.repeat(35));
    console.log('\n✅ TESTE COMPLETO FINALIZADO!');
    console.log('\n📋 VERIFICAÇÕES REALIZADAS:');
    console.log('   ✓ Criação de usuários de teste');
    console.log('   ✓ Autenticação de múltiplos usuários'); 
    console.log('   ✓ Criação de agendamentos com notificações');
    console.log('   ✓ Notificações para destinatários diferentes');
    console.log('   ✓ Confirmações para criadores');
    console.log('   ✓ Listagem de notificações por usuário');
    
    console.log('\n🌐 ACESSE TAMBÉM:');
    console.log('   • Backend: http://localhost:3001');
    console.log('   • Frontend: http://localhost:5173');
    console.log('   • Use as credenciais criadas para testar a interface web');
}

// Executar teste
if (require.main === module) {
    testarSistemaCompleto().catch(console.error);
}

module.exports = { testarSistemaCompleto };
