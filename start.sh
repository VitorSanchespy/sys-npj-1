#!/bin/bash

# 🚀 Sistema NPJ - Script de Inicialização Rápida
# Inicia todos os serviços em terminais separados

echo "🚀 Iniciando Sistema NPJ..."
echo "=========================="

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ Execute este script na raiz do projeto"
    exit 1
fi

# Verificar se MySQL está rodando
if ! pgrep mysql > /dev/null; then
    echo "🔄 Iniciando MySQL..."
    
    # Linux/Ubuntu
    if command -v systemctl &> /dev/null; then
        sudo systemctl start mysql
    # macOS
    elif command -v brew &> /dev/null; then
        brew services start mysql
    else
        echo "⚠️ Inicie o MySQL manualmente antes de continuar"
        exit 1
    fi
    
    sleep 3
fi

echo "✅ MySQL rodando"

# Função para abrir novo terminal e executar comando
open_terminal() {
    local cmd="$1"
    local title="$2"
    
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        osascript -e "tell application \"Terminal\" to do script \"cd $(pwd) && $cmd\""
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        if command -v gnome-terminal &> /dev/null; then
            gnome-terminal --title="$title" -- bash -c "cd $(pwd) && $cmd; bash"
        elif command -v xterm &> /dev/null; then
            xterm -title "$title" -e "cd $(pwd) && $cmd; bash" &
        else
            echo "⚠️ Terminal não suportado. Execute manualmente:"
            echo "   $cmd"
        fi
    else
        echo "⚠️ Sistema operacional não suportado"
        echo "Execute manualmente em terminais separados:"
        echo "   Terminal 1: cd backend && npm start"
        echo "   Terminal 2: cd frontend && npm run dev"
        exit 1
    fi
}

echo "🖥️ Iniciando Backend..."
open_terminal "cd backend && echo '🚀 Iniciando Backend...' && npm start" "NPJ Backend"

echo "⏳ Aguardando backend inicializar..."
sleep 5

echo "🌐 Iniciando Frontend..."
open_terminal "cd frontend && echo '🚀 Iniciando Frontend...' && npm run dev" "NPJ Frontend"

echo ""
echo "🎉 Sistema NPJ iniciado!"
echo "======================="
echo ""
echo "🔗 URLs disponíveis:"
echo "   📱 Frontend: http://localhost:5173"
echo "   ⚙️ Backend:  http://localhost:3001"
echo ""
echo "👤 Login padrão:"
echo "   📧 Email: admin@teste.com"
echo "   🔑 Senha: admin123"
echo ""
echo "📋 Para parar o sistema:"
echo "   Feche os terminais ou pressione Ctrl+C em cada um"
echo ""
echo "🚀 Desenvolvimento iniciado com sucesso!"
