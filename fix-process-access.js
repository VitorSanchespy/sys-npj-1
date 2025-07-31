const { execSync } = require('child_process');

function executarComandoSQL(comando) {
    try {
        const resultado = execSync(
            `docker exec -i sistema-npj-db-1 mysql -u root -p'12345678@' npjdatabase -e "${comando}"`,
            { encoding: 'utf8' }
        );
        return resultado;
    } catch (error) {
        console.error('Erro ao executar comando SQL:', error.message);
        return null;
    }
}

console.log('🔍 Verificando estado atual do banco...');

// Verificar se existe processo ID 4
console.log('\n📋 Verificando processos existentes:');
const processos = executarComandoSQL('SELECT id, numero_processo, idusuario_responsavel FROM processos ORDER BY id;');
console.log(processos);

// Verificar usuários
console.log('\n👥 Verificando usuários:');
const usuarios = executarComandoSQL('SELECT id, nome, email, role FROM usuarios;');
console.log(usuarios);

// Verificar relações usuário-processo
console.log('\n🔗 Verificando relações usuário-processo:');
const relacoes = executarComandoSQL('SELECT * FROM usuarios_processo;');
console.log(relacoes);

// Criar processo 4 se não existir
console.log('\n🔹 Criando/verificando processo ID 4...');
const criarProcesso = `
INSERT IGNORE INTO processos (id, numero_processo, parte_contraria, comarca, vara, valor_causa, tipo_acao, assunto, status, prioridade, descricao, idusuario_responsavel, criado_em, atualizado_em) 
VALUES (4, '2025-004-TESTE', 'Teste Parte Contrária', 'São Paulo', '1ª Vara Civil', 5000.00, 'Civil', 'Teste Sistema', 'Em Andamento', 'Normal', 'Processo criado para testes do sistema', 1, NOW(), NOW());
`;
executarComandoSQL(criarProcesso);

// Dar acesso ao aluno (ID 5) ao processo 4
console.log('\n🔹 Dando acesso ao aluno ao processo 4...');
const darAcesso = `
INSERT IGNORE INTO usuarios_processo (usuario_id, processo_id, criado_em, atualizado_em) 
VALUES (5, 4, NOW(), NOW());
`;
executarComandoSQL(darAcesso);

// Verificar se funcionou
console.log('\n✅ Verificando resultado final:');
const verificacao = executarComandoSQL('SELECT p.id, p.numero_processo, u.nome as responsavel, up.usuario_id as tem_acesso FROM processos p LEFT JOIN usuarios u ON p.idusuario_responsavel = u.id LEFT JOIN usuarios_processo up ON p.id = up.processo_id WHERE p.id = 4;');
console.log(verificacao);

console.log('\n🎉 Configuração do banco concluída!');
console.log('Agora o aluno (ID 5) deve ter acesso ao processo 4.');
