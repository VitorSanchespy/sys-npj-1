# Sistema NPJ - Backend de Produção

## 🚀 Sistema de Agendamentos Modular

### Arquitetura Híbrida
O sistema possui dois modos de operação:

#### Modo Modular (Recomendado para Produção)
```bash
USE_MODULAR_CONTROLLERS=true
```
- 3 Controllers especializados
- 4 Serviços de apoio
- 182 testes unitários
- Melhor manutenibilidade e performance

#### Modo Legacy (Backup)
```bash
USE_MODULAR_CONTROLLERS=false
```
- Controller monolítico (fallback)
- Mantido para compatibilidade

### Estrutura de Controllers Modularizados

```
controllers/agendamento/
├── AgendamentoManagementController.js  # CRUD básico
├── AgendamentoConviteController.js     # Gestão de convites
└── AgendamentoStatusController.js      # Controle de status
```

### Serviços de Apoio

```
services/agendamento/
├── AgendamentoValidationService.js     # Validação
├── ConvidadoUtilsService.js           # Utilitários de convidados
├── AgendamentoStatusService.js        # Lógica de status
└── AgendamentoEmailTemplateService.js # Templates de email
```

## 📊 Estatísticas

- **Controllers Modularizados**: 3
- **Serviços de Apoio**: 4
- **Testes Unitários**: 182
- **Cobertura de Testes**: >60%
- **Endpoints API**: 42

## 🔧 Configuração

### Variáveis de Ambiente
```env
USE_MODULAR_CONTROLLERS=true  # Usar sistema modular
PORT=3001
DB_HOST=localhost
DB_USER=seu_usuario
DB_PASS=sua_senha
DB_NAME=npj_database
```

### Instalação
```bash
npm install
npm run migrate
npm start
```

### Testes
```bash
# Todos os testes
npm test

# Apenas controllers modularizados
npm run test:controllers

# Apenas serviços
npm run test:services
```

## 📋 Deploy

### Produção
1. Configure `USE_MODULAR_CONTROLLERS=true`
2. Execute `npm run build`
3. Inicie com `npm start`

### Rollback de Emergência
1. Configure `USE_MODULAR_CONTROLLERS=false`
2. Reinicie o serviço
3. Sistema volta ao modo legacy automaticamente

## 🎯 Monitoramento

O sistema inclui headers de debugging:
- `X-Controller-Type`: MODULAR ou MONOLITICO
- `X-Controller-Feature`: crud, convites, status
- `X-Response-Time`: Tempo de resposta em ms

## 📈 Performance

### Modo Modular
- Menor acoplamento
- Melhor cache
- Testes isolados
- Deploy independente

### Modo Legacy
- Compatibilidade total
- Fallback seguro
- Código consolidado

## ⚙️ Manutenção

### Logs
Os logs incluem informações detalhadas sobre qual modo está sendo usado e performance de cada controller.

### Debugging
Use os headers HTTP para identificar qual sistema está processando cada requisição.

### Atualização
Para remover completamente o sistema legacy após estabilização:
1. Remova `controllers/agendamentoController.js`
2. Remova referências no middleware de integração
3. Simplifique as rotas removendo a lógica de alternância

---

**Status**: ✅ PRONTO PARA PRODUÇÃO
**Data**: 26/09/2025
**Versão**: 2.0.0 (Arquitetura Modular)