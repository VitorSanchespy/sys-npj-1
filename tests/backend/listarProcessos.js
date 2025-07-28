const { processoModels } = require('../../backend/models/indexModels');

async function listarProcessos() {
    try {
        const processos = await processoModels.findAll({
            limit: 5,
            attributes: ['id', 'numero_processo', 'descricao', 'status']
        });
        
        console.log('📋 Processos encontrados:');
        if (processos.length === 0) {
            console.log('   Nenhum processo encontrado');
        } else {
            processos.forEach(p => {
                console.log(`- ID: ${p.id}, Número: ${p.numero_processo}, Assunto: ${p.assunto}, Assistido: ${p.assistido_nome}`);
            });
        }
    } catch (error) {
        console.error('❌ Erro:', error.message);
    }
}

listarProcessos();
