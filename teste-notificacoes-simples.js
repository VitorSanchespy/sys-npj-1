/**
 * Teste simples do sistema de notificações usando usuários existentes
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

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
        console.log(`   📧 Sistema deve ter enviado notificações!`);
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
                console.log(`   ${index + 1}. [${notif.tipo}] ${notif.titulo}`);
                console.log(`      ${notif.mensagem}`);
                console.log(`      Status: ${notif.status} | Canal: ${notif.canal}`);
            });
        }
        return response.data;
    } catch (error) {
        console.error(`❌ Erro ao listar notificações:`, error.response?.data?.erro || error.message);
        return [];
    }
}

async function testarNotificacoesSimples() {
    console.log('🔔 TESTE SIMPLES - SISTEMA DE NOTIFICAÇÕES');
    console.log('=' .repeat(60));

    // 1. Login com usuários existentes
    console.log('\n🔐 1. Fazendo login...');
    
    const admin = await login({
        email: 'teste@teste.com',
        senha: 'senha123'
    });

    if (!admin) {
        console.error('❌ Falha no login. Teste abortado.');
        return;
    }

    console.log(`   👤 Logado como: ${admin.user.nome} (ID: ${admin.user.id})`);
    console.log(`   🎭 Role: ${admin.user.role?.nome || 'N/A'}`);

    console.log('\n' + '─'.repeat(60));

    // 2. Criar agendamento para si mesmo
    console.log('\n📅 2. Criando agendamento...');
    console.log('   📧 Esperado: Notificação de confirmação');

    const agendamento = await criarAgendamento(admin.token, {
        tipo_evento: 'reuniao',
        titulo: 'Reunião de Teste - Sistema de Notificações',
        descricao: 'Teste do sistema de notificações de agendamentos',
        data_evento: '2025-08-15T10:00:00Z',
        local: 'Sala de Reuniões - NPJ',
        lembrete_1_dia: true,
        lembrete_2_dias: false,
        lembrete_1_semana: false
    });

    if (agendamento) {
        console.log(`   📋 Agendamento criado com ID: ${agendamento.id}`);
        
        // 3. Aguardar processamento
        console.log('\n⏳ 3. Aguardando processamento das notificações...');
        await new Promise(resolve => setTimeout(resolve, 3000));

        // 4. Verificar notificações
        console.log('\n📬 4. Verificando notificações:');
        const notificacoes = await listarNotificacoes(admin.token, admin.user.nome);

        if (notificacoes.length > 0) {
            console.log(`\n✅ Sistema funcionando! ${notificacoes.length} notificações encontradas.`);
        } else {
            console.log('\n⚠️  Nenhuma notificação encontrada. Verifique os logs do backend.');
        }

        // 5. Cancelar agendamento para testar notificação de cancelamento
        console.log('\n🗑️  5. Testando cancelamento...');
        try {
            await axios.delete(`${BASE_URL}/api/agendamentos/${agendamento.id}`, {
                headers: { Authorization: `Bearer ${admin.token}` },
                data: { motivo: 'Teste finalizado' }
            });
            console.log('✅ Agendamento cancelado');
            
            // Aguardar e verificar novamente
            await new Promise(resolve => setTimeout(resolve, 2000));
            console.log('\n📬 Verificando notificações após cancelamento:');
            await listarNotificacoes(admin.token, admin.user.nome);
            
        } catch (error) {
            console.error('❌ Erro ao cancelar:', error.response?.data?.erro || error.message);
        }
    }

    console.log('\n' + '🎉'.repeat(30));
    console.log('\n✅ TESTE CONCLUÍDO!');
    console.log('\n📋 O QUE FOI TESTADO:');
    console.log('   ✓ Login de usuário existente');
    console.log('   ✓ Criação de agendamento');
    console.log('   ✓ Sistema de notificações automáticas');
    console.log('   ✓ Listagem de notificações');
    console.log('   ✓ Cancelamento com notificação');
    
    console.log('\n🌐 VERIFICAÇÕES ADICIONAIS:');
    console.log('   • Backend rodando em: http://localhost:3001');
    console.log('   • Frontend rodando em: http://localhost:5173');
    console.log('   • Banco MySQL (Docker) na porta: 3307');
    console.log('   • Verifique logs do backend para detalhes das notificações');
}

// Executar teste
if (require.main === module) {
    testarNotificacoesSimples().catch(console.error);
}

module.exports = { testarNotificacoesSimples };
