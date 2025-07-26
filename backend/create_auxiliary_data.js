const sequelize = require('./config/sequelize');
const { 
  materiaAssuntoModels,
  faseModels,
  diligenciaModels,
  localTramitacaoModels 
} = require('./models/indexModels');

async function createAuxiliaryData() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conectado ao banco de dados');

    // Criar Matéria/Assunto
    const materiaAssuntos = [
      { nome: 'Direito Civil' },
      { nome: 'Direito Penal' },
      { nome: 'Direito Trabalhista' },
      { nome: 'Direito Previdenciário' }
    ];

    for (const materia of materiaAssuntos) {
      await materiaAssuntoModels.findOrCreate({
        where: { nome: materia.nome },
        defaults: materia
      });
    }
    console.log('✅ Matérias/Assuntos criadas');

    // Criar Fases
    const fases = [
      { nome: 'Inicial' },
      { nome: 'Instrução' },
      { nome: 'Julgamento' },
      { nome: 'Recurso' },
      { nome: 'Execução' }
    ];

    for (const fase of fases) {
      await faseModels.findOrCreate({
        where: { nome: fase.nome },
        defaults: fase
      });
    }
    console.log('✅ Fases criadas');

    // Criar Diligências
    const diligencias = [
      { nome: 'Citação' },
      { nome: 'Audiência' },
      { nome: 'Perícia' },
      { nome: 'Intimação' },
      { nome: 'Juntada de documentos' }
    ];

    for (const diligencia of diligencias) {
      await diligenciaModels.findOrCreate({
        where: { nome: diligencia.nome },
        defaults: diligencia
      });
    }
    console.log('✅ Diligências criadas');

    // Criar Locais de Tramitação
    const locais = [
      { nome: '1ª Vara Cível' },
      { nome: '2ª Vara Cível' },
      { nome: '1ª Vara Criminal' },
      { nome: 'Vara do Trabalho' },
      { nome: 'Juizado Especial Cível' }
    ];

    for (const local of locais) {
      await localTramitacaoModels.findOrCreate({
        where: { nome: local.nome },
        defaults: local
      });
    }
    console.log('✅ Locais de tramitação criados');

    console.log('\n🎉 Dados auxiliares criados com sucesso!');

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await sequelize.close();
  }
}

createAuxiliaryData();
