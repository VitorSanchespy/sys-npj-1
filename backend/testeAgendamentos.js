// Teste do sistema de agendamentos baseado em roles
const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

// Credenciais de teste
const usuarios = {
    admin: { email: 'admin@teste.com', senha: 'admin123' },
    professor: { email: 'joao@teste.com', senha: 'joao123' },
    aluno: { email: 'maria@teste.com', senha: 'maria123' }
};

async function login(usuario) {
    try {
        const response = await axios.post(`${BASE_URL}/auth/login`, usuario);
        return response.data.token;
    } catch (error) {
        console.error(`Erro ao fazer login para ${usuario.email}:`, error.response?.data?.erro || error.message);
        return null;
    }
}

async function listarAgendamentos(token, nomeUsuario) {
    try {
        const response = await axios.get(`${BASE_URL}/api/agendamentos`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`\n📅 Agendamentos visíveis para ${nomeUsuario}:`);
        console.log(`Total: ${response.data.length}`);
        
        response.data.forEach((agendamento, index) => {
            console.log(`\n${index + 1}. ${agendamento.titulo}`);
            console.log(`   Criado por: ${agendamento.criador?.nome} (${agendamento.criador?.role})`);
            console.log(`   Destinatário: ${agendamento.destinatario?.nome} (${agendamento.destinatario?.role})`);
            console.log(`   Data: ${new Date(agendamento.data_evento).toLocaleString()}`);
            console.log(`   Local: ${agendamento.local}`);
        });
        
        return response.data;
    } catch (error) {
        console.error(`Erro ao listar agendamentos para ${nomeUsuario}:`, error.response?.data?.erro || error.message);
        return [];
    }
}

async function criarAgendamento(token, nomeUsuario, agendamento) {
    try {
        const response = await axios.post(`${BASE_URL}/api/agendamentos`, agendamento, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`\n✅ ${nomeUsuario} criou agendamento: ${agendamento.titulo}`);
        return response.data;
    } catch (error) {
        console.error(`\n❌ ${nomeUsuario} não conseguiu criar agendamento:`, error.response?.data?.erro || error.message);
        return null;
    }
}

async function excluirAgendamento(token, nomeUsuario, agendamentoId) {
    try {
        await axios.delete(`${BASE_URL}/api/agendamentos/${agendamentoId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`\n✅ ${nomeUsuario} excluiu agendamento ID ${agendamentoId}`);
        return true;
    } catch (error) {
        console.error(`\n❌ ${nomeUsuario} não conseguiu excluir agendamento:`, error.response?.data?.erro || error.message);
        return false;
    }
}

async function testarSistemaAgendamentos() {
    console.log('🔍 TESTANDO SISTEMA DE AGENDAMENTOS BASEADO EM ROLES');
    console.log('=' .repeat(60));

    // 1. Fazer login com todos os usuários
    console.log('\n1️⃣ Fazendo login com todos os usuários...');
    const tokens = {};
    
    for (const [role, credenciais] of Object.entries(usuarios)) {
        const token = await login(credenciais);
        if (token) {
            tokens[role] = token;
            console.log(`✅ Login ${role} realizado com sucesso`);
        } else {
            console.log(`❌ Falha no login ${role}`);
            return;
        }
    }

    // 2. Testar visibilidade de agendamentos por role
    console.log('\n2️⃣ Testando visibilidade de agendamentos por role...');
    
    const agendamentosAdmin = await listarAgendamentos(tokens.admin, 'Admin');
    const agendamentosProfessor = await listarAgendamentos(tokens.professor, 'Professor');
    const agendamentosAluno = await listarAgendamentos(tokens.aluno, 'Aluno');

    // 3. Testar criação de agendamentos
    console.log('\n3️⃣ Testando criação de agendamentos...');
    
    // Admin criando para si mesmo
    await criarAgendamento(tokens.admin, 'Admin', {
      tipo_evento: 'reuniao',
      titulo: 'Reunião Administrativa',
      descricao: 'Reunião mensal da coordenação',
      data_evento: '2025-03-01T10:00:00Z',
      local: 'Sala da Coordenação'
    });

    // Professor criando para aluno (deve funcionar)
    const agendamentoProfessorParaAluno = await criarAgendamento(tokens.professor, 'Professor', {
      usuario_id: 353, // ID da Maria (aluna)
      tipo_evento: 'reuniao',
      titulo: 'Orientação de TCC',
      descricao: 'Orientação sobre desenvolvimento do TCC',
      data_evento: '2025-03-05T14:00:00Z',
      local: 'Sala do Professor'
    });

    // Aluno tentando criar para professor (deve falhar)
    await criarAgendamento(tokens.aluno, 'Aluno', {
      usuario_id: 352, // ID do Admin
      tipo_evento: 'reuniao',
      titulo: 'Tentativa Inválida',
      descricao: 'Aluno tentando criar para admin',
      data_evento: '2025-03-10T10:00:00Z',
      local: 'Qualquer lugar'
    });    // 4. Testar exclusão de agendamentos
    console.log('\n4️⃣ Testando exclusão de agendamentos...');
    
    if (agendamentosAdmin.length > 0) {
        const primeiroAgendamento = agendamentosAdmin[0];
        
        // Aluno tentando excluir agendamento do admin (deve falhar)
        await excluirAgendamento(tokens.aluno, 'Aluno', primeiroAgendamento.id);
        
        // Admin excluindo próprio agendamento (deve funcionar)
        // await excluirAgendamento(tokens.admin, 'Admin', primeiroAgendamento.id);
    }

    // 5. Verificar visibilidade final
    console.log('\n5️⃣ Verificando visibilidade final dos agendamentos...');
    await listarAgendamentos(tokens.admin, 'Admin (final)');
    await listarAgendamentos(tokens.professor, 'Professor (final)');
    await listarAgendamentos(tokens.aluno, 'Aluno (final)');

    console.log('\n🎉 Teste concluído!');
    console.log('\n📋 RESUMO ESPERADO:');
    console.log('- Admin: vê apenas agendamentos que criou');
    console.log('- Professor: vê apenas agendamentos que criou');
    console.log('- Aluno: vê agendamentos criados para ele + os que ele criou');
    console.log('- Apenas quem criou pode excluir agendamentos');
}

// Executar teste
testarSistemaAgendamentos().catch(console.error);
