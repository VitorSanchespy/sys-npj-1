/**
 * Teste dos modelos para debug
 */

const models = require('./backend/models/indexModel');

console.log('📋 Modelos disponíveis:');
console.log('Chaves:', Object.keys(models));

console.log('\nProcesso Model:', !!models.processoModel);
console.log('Usuario Model:', !!models.usuarioModel);

if (models.processoModel) {
  console.log('Processo tem count?', typeof models.processoModel.count);
}

if (models.usuarioModel) {
  console.log('Usuario tem count?', typeof models.usuarioModel.count);
}
