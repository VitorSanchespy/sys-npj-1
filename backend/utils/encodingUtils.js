// Utilitário para corrigir dados com encoding corrompido
const { sequelize } = require('../db/indexModels');

// Função para corrigir encoding
function fixEncoding(text) {
  if (!text || typeof text !== 'string') return text;
  
  const charFixMap = {
    'Ã§': 'ç', 'Ã£': 'ã', 'Ã¡': 'á', 'Ã©': 'é', 'Ã­': 'í', 'Ã³': 'ó', 'Ãº': 'ú',
    'Ã¢': 'â', 'Ãª': 'ê', 'Ã´': 'ô', 'Ã ': 'à', 'Ã¨': 'è', 'Ã¬': 'ì', 'Ã²': 'ò',
    'Ã¹': 'ù', 'Ã…': 'Å', 'Ã‡': 'Ç'
  };
  
  let fixed = text;
  for (const [wrong, correct] of Object.entries(charFixMap)) {
    fixed = fixed.replace(new RegExp(wrong, 'g'), correct);
  }
  return fixed;
}

// Função para corrigir dados no banco
async function fixDatabaseEncoding() {
  try {
    console.log('🔧 Corrigindo encoding no banco de dados...');
    
    // Queries para corrigir as tabelas mais comuns
    const queries = [
      // Agendamentos
      `UPDATE agendamentos SET 
       titulo = REPLACE(REPLACE(REPLACE(titulo, 'Ã§', 'ç'), 'Ã£', 'ã'), 'Ã¡', 'á'),
       descricao = REPLACE(REPLACE(REPLACE(descricao, 'Ã§', 'ç'), 'Ã£', 'ã'), 'Ã¡', 'á'),
       local = REPLACE(REPLACE(REPLACE(local, 'Ã§', 'ç'), 'Ã£', 'ã'), 'Ã¡', 'á')
       WHERE titulo LIKE '%Ã%' OR descricao LIKE '%Ã%' OR local LIKE '%Ã%'`,
      
      // Processos
      `UPDATE processos SET 
       descricao = REPLACE(REPLACE(REPLACE(descricao, 'Ã§', 'ç'), 'Ã£', 'ã'), 'Ã¡', 'á'),
       assistido = REPLACE(REPLACE(REPLACE(assistido, 'Ã§', 'ç'), 'Ã£', 'ã'), 'Ã¡', 'á'),
       observacoes = REPLACE(REPLACE(REPLACE(observacoes, 'Ã§', 'ç'), 'Ã£', 'ã'), 'Ã¡', 'á')
       WHERE descricao LIKE '%Ã%' OR assistido LIKE '%Ã%' OR observacoes LIKE '%Ã%'`,
      
      // Usuários
      `UPDATE usuarios SET 
       nome = REPLACE(REPLACE(REPLACE(nome, 'Ã§', 'ç'), 'Ã£', 'ã'), 'Ã¡', 'á')
       WHERE nome LIKE '%Ã%'`,
       
      // Tabelas auxiliares
      `UPDATE fases SET nome = REPLACE(REPLACE(REPLACE(nome, 'Ã§', 'ç'), 'Ã£', 'ã'), 'Ã¡', 'á') WHERE nome LIKE '%Ã%'`,
      `UPDATE materias_assunto SET nome = REPLACE(REPLACE(REPLACE(nome, 'Ã§', 'ç'), 'Ã£', 'ã'), 'Ã¡', 'á') WHERE nome LIKE '%Ã%'`,
      `UPDATE locais_tramitacao SET nome = REPLACE(REPLACE(REPLACE(nome, 'Ã§', 'ç'), 'Ã£', 'ã'), 'Ã¡', 'á') WHERE nome LIKE '%Ã%'`,
      `UPDATE diligencias SET nome = REPLACE(REPLACE(REPLACE(nome, 'Ã§', 'ç'), 'Ã£', 'ã'), 'Ã¡', 'á') WHERE nome LIKE '%Ã%'`
    ];
    
    for (const query of queries) {
      try {
        const [results] = await sequelize.query(query);
        if (results.affectedRows > 0) {
          console.log(`✅ Corrigidos ${results.affectedRows} registros`);
        }
      } catch (error) {
        console.log(`⚠️ Erro em query (normal se tabela não existir):`, error.message);
      }
    }
    
    console.log('✅ Correção de encoding concluída');
    return true;
  } catch (error) {
    console.error('❌ Erro ao corrigir encoding:', error);
    return false;
  }
}

module.exports = {
  fixEncoding,
  fixDatabaseEncoding
};
