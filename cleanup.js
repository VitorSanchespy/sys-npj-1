#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('\n🧹 ========================================');
console.log('   SCRIPT DE LIMPEZA - SISTEMA NPJ');
console.log('========================================\n');

// Verificar se estamos no diretório correto
if (!fs.existsSync('backend') || !fs.existsSync('frontend')) {
    console.error('❌ Erro: Execute este script na raiz do projeto sys-npj-1');
    process.exit(1);
}

console.log(`📂 Diretório atual: ${process.cwd()}\n`);

// Função para remover com segurança
function removeSafely(itemPath, description) {
    try {
        if (fs.existsSync(itemPath)) {
            const stats = fs.statSync(itemPath);
            if (stats.isDirectory()) {
                fs.rmSync(itemPath, { recursive: true, force: true });
            } else {
                fs.unlinkSync(itemPath);
            }
            console.log(`    ✅ ${description}`);
            return true;
        }
        return false;
    } catch (error) {
        console.error(`    ❌ Erro ao remover ${description}: ${error.message}`);
        return false;
    }
}

// Função para encontrar e remover arquivos por padrão
function removeByPattern(dir, pattern, description) {
    try {
        if (!fs.existsSync(dir)) return;
        
        const items = fs.readdirSync(dir, { withFileTypes: true });
        
        items.forEach(item => {
            const itemPath = path.join(dir, item.name);
            
            if (item.isDirectory()) {
                removeByPattern(itemPath, pattern, description);
            } else if (item.name.match(pattern)) {
                removeSafely(itemPath, `${description}: ${item.name}`);
            }
        });
    } catch (error) {
        console.error(`Erro ao processar ${dir}: ${error.message}`);
    }
}

// Parar processos Node.js (apenas Windows)
console.log('🛑 Finalizando processos Node.js...');
try {
    if (process.platform === 'win32') {
        execSync('taskkill /f /im node.exe', { stdio: 'ignore' });
        execSync('taskkill /f /im npm.exe', { stdio: 'ignore' });
    } else {
        execSync('pkill -f node', { stdio: 'ignore' });
        execSync('pkill -f npm', { stdio: 'ignore' });
    }
    console.log('✅ Processos finalizados');
} catch (error) {
    console.log('ℹ️  Nenhum processo Node.js ativo encontrado');
}
console.log('');

// Limpar node_modules e builds
console.log('📦 Removendo dependências e builds...');
removeSafely('backend/node_modules', 'Backend node_modules');
removeSafely('backend/package-lock.json', 'Backend package-lock.json');
removeSafely('frontend/node_modules', 'Frontend node_modules');
removeSafely('frontend/package-lock.json', 'Frontend package-lock.json');
removeSafely('frontend/dist', 'Frontend build (dist)');
removeSafely('frontend/.vite', 'Vite cache');
console.log('');

// Limpar arquivos de debug e mock
console.log('🐛 Removendo arquivos de debug e mock...');
removeSafely('backend-mock.js', 'Backend mock');
removeSafely('frontend/src/components/debug', 'Componentes de debug');
removeSafely('test-api.js', 'Script de teste API');
console.log('');

// Limpar logs
console.log('📋 Removendo arquivos de log...');
removeByPattern('.', /\.log$/, 'Log');
console.log('');

// Limpar cache e temporários
console.log('💾 Removendo cache e arquivos temporários...');
removeSafely('.npm', 'Cache npm global');
removeSafely('.cache', 'Cache geral');
removeSafely('.nyc_output', 'Cache nyc');

// Arquivos temporários
const tempPatterns = [
    /\.tmp$/,
    /\.temp$/,
    /~$/,
    /\.bak$/,
    /\.orig$/
];

tempPatterns.forEach(pattern => {
    removeByPattern('.', pattern, 'Arquivo temporário');
});
console.log('');

// Arquivos específicos do Windows
if (process.platform === 'win32') {
    console.log('🪟 Removendo arquivos específicos do Windows...');
    removeByPattern('.', /^Thumbs\.db$/, 'Thumbs.db');
    removeByPattern('.', /^desktop\.ini$/, 'desktop.ini');
    console.log('');
}

// Coverage
console.log('📊 Removendo arquivos de coverage...');
removeSafely('coverage', 'Coverage raiz');
removeSafely('backend/coverage', 'Coverage backend');
removeSafely('frontend/coverage', 'Coverage frontend');
console.log('');

// Bancos temporários
console.log('🗄️  Removendo bancos de dados temporários...');
removeByPattern('.', /\.(sqlite|db)$/, 'Database temporário');
console.log('');

// Configurações temporárias
console.log('⚙️  Removendo configurações temporárias...');
removeSafely('.env.temp', 'Env temporário');
removeSafely('backend/.env.backup', 'Backup env backend');
removeSafely('config.temp.js', 'Config temporário');
console.log('');

console.log('✅ ========================================');
console.log('   LIMPEZA CONCLUÍDA COM SUCESSO!');
console.log('========================================\n');

console.log('📝 Resumo das ações executadas:');
console.log('   • Processos Node.js finalizados');
console.log('   • Dependencies (node_modules) removidas');
console.log('   • Arquivos de build removidos');
console.log('   • Arquivos de debug e mock removidos');
console.log('   • Logs e cache limpos');
console.log('   • Arquivos temporários removidos');
console.log('   • Configurações temporárias limpas');
console.log('   • Bancos de dados temporários removidos\n');

console.log('🚀 Para reinstalar dependências:');
console.log('   cd backend && npm install');
console.log('   cd frontend && npm install\n');

console.log('💡 Para rodar o projeto:');
console.log('   Backend: cd backend && npm start');
console.log('   Frontend: cd frontend && npm run dev\n');