# 📊 TanStack Query v5 - Guia de Debug e Uso

## 🎯 Como Verificar se o Cache Está Funcionando

### 1. **Abrir o DevTools do React Query**
- Pressione `F12` para abrir as DevTools do navegador
- Na parte inferior da tela, você verá o painel do **React Query DevTools**
- Se não aparecer, clique no botão ⚙️ no canto inferior direito da tela

### 2. **Interpretar o DevTools**

#### **Status das Queries:**
- 🟢 **Fresh** - Dados em cache e ainda válidos (dentro do `staleTime`)
- 🟡 **Stale** - Dados em cache mas expirados (serão revalidados em background)
- 🔵 **Fetching** - Buscando dados da API agora
- 🔴 **Error** - Erro na busca de dados
- ⚪ **Inactive** - Query não está sendo usada por nenhum componente

#### **Informações Importantes:**
- **Observer count** - Quantos componentes estão usando esta query
- **Last Updated** - Quando os dados foram atualizados pela última vez
- **Data Update Count** - Quantas vezes os dados foram atualizados

### 3. **Indicadores Visuais na Aplicação**

#### **No Dashboard:**
- 📊 **Query Status** (canto inferior direito) - mostra estatísticas em tempo real
- 🔄 **Botão Refresh Cache** - muda para "⏳ Atualizando..." quando buscando dados
- ⏱️ **Última atualização** - timestamp da última sincronização

#### **Botões de Debug (apenas em desenvolvimento):**
- 🔄 **Refresh Cache** - força uma nova busca na API
- 🗑️ **Invalidar** - marca os dados como expirados (forçará revalidação)
- 🧹 **Limpar** - remove todos os dados do cache
- 📊 **Status** - mostra estatísticas detalhadas no console

### 4. **Console Logs de Debug**

Abra o Console (F12 → Console) e procure por:

```
🔄 TanStack Query: Buscando dados do dashboard...
📊 Buscando processos do aluno...
✅ Processos carregados: 5
👥 Buscando usuários (admin)...
✅ Usuários carregados: 12
📄 Buscando atualizações recentes...
✅ Atualizações carregadas: 3
🎯 Dashboard data final: {...}
```

### 5. **Testar o Cache**

#### **Teste 1: Cache Hit (dados já em cache)**
1. Acesse o Dashboard
2. Navegue para outra página (ex: Processos)
3. Volte para o Dashboard
4. **Resultado esperado**: Dados aparecem instantaneamente (cache hit)

#### **Teste 2: Refresh Manual**
1. No Dashboard, clique em "🔄 Refresh Cache"
2. **Resultado esperado**: Botão muda para "⏳ Atualizando..." e dados são revalidados

#### **Teste 3: Refetch ao Focar Janela**
1. Minimize ou mude de aba no navegador
2. Volte para a aba da aplicação
3. **Resultado esperado**: Dados são automaticamente revalidados (se estiverem stale)

#### **Teste 4: Invalidação de Cache**
1. Clique no botão "🗑️ Invalidar" (modo desenvolvimento)
2. **Resultado esperado**: Próxima navegação irá buscar dados novos da API

### 6. **Configurações de Cache Atuais**

```javascript
// Dashboard
staleTime: 1000 * 60 * 3, // 3 minutos
gcTime: 1000 * 60 * 10,   // 10 minutos

// Processos
staleTime: 1000 * 60 * 2, // 2 minutos

// Arquivos
staleTime: 1000 * 60 * 5, // 5 minutos
```

### 7. **Comandos de Debug no Console**

```javascript
// Verificar status de todas as queries
window.__REACT_QUERY_CLIENT__.getQueryCache().getAll()

// Invalidar cache específico
window.__REACT_QUERY_CLIENT__.invalidateQueries(['dashboard'])

// Limpar todo o cache
window.__REACT_QUERY_CLIENT__.clear()
```

### 8. **Indicadores de que o Cache está Funcionando**

✅ **Funcionando Corretamente:**
- Navegação entre páginas é instantânea
- DevTools mostra queries com status "Fresh" ou "Stale"
- Botão refresh mostra "⏳ Atualizando..." quando clicado
- Console logs mostram "cache hit" ou "revalidating"

❌ **Problemas:**
- Dados sempre carregam do zero
- DevTools sempre mostra "Fetching"
- Navegação é lenta
- Não há queries no cache

### 9. **Troubleshooting**

#### **Problema: Cache não funciona**
- Verifique se `queryKey` está consistente
- Confirme se `enabled: !!token` está correto
- Verifique se não há erros de token/auth

#### **Problema: Dados não atualizam**
- Use `refetch()` para forçar atualização
- Verifique `staleTime` - pode estar muito alto
- Use `invalidateQueries()` após mutations

#### **Problema: Performance ruim**
- Ajuste `staleTime` para dados que mudam pouco
- Use `select` para filtrar dados no cache
- Configure `gcTime` adequadamente

## 🎉 Resultado Final

Com esta configuração, você terá:
- 🚀 **Navegação super rápida** entre páginas
- 📡 **Sincronização automática** de dados
- 🔄 **Revalidação inteligente** em background
- 🛠️ **Ferramentas de debug** completas
- 📊 **Monitoramento em tempo real** do cache
