# Guia de Configuração - Google Calendar Integration

## Visão Geral

A integração com Google Calendar permite que os agendamentos criados no sistema NPJ sejam automaticamente sincronizados com o Google Calendar dos usuários, incluindo:

- ✅ Criação automática de eventos
- ✅ Lembretes por email e notificações
- ✅ Sincronização em tempo real
- ✅ Controle individual por usuário

## Pré-requisitos

### 1. Configurar Projeto no Google Cloud Console

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Ative a **Google Calendar API**:
   - Vá para "APIs & Services" > "Library"
   - Busque por "Google Calendar API"
   - Clique em "Enable"

### 2. Configurar OAuth 2.0

1. Vá para "APIs & Services" > "Credentials"
2. Clique em "Create Credentials" > "OAuth 2.0 Client ID"
3. Configure:
   - **Application type**: Web application
   - **Name**: Sistema NPJ
   - **Authorized JavaScript origins**: 
     - `http://localhost:5173`
     - `http://localhost:5174`
     - Adicione domínios de produção quando aplicável
   - **Authorized redirect URIs**:
     - `http://localhost:5173/auth/google/callback`
     - `http://localhost:5174/auth/google/callback`
     - Adicione URLs de produção quando aplicável

4. Copie o **Client ID** e **Client Secret**

### 3. Configurar Variáveis de Ambiente

No arquivo `backend/.env`, configure:

```env
GOOGLE_CLIENT_ID=seu_client_id_aqui
GOOGLE_CLIENT_SECRET=seu_client_secret_aqui
GOOGLE_REDIRECT_URI=http://localhost:5173/auth/google/callback
```

## Como Usar

### 1. Para Usuários

1. **Conectar Google Calendar**:
   - Acesse a página de Agendamentos
   - Clique em "Conectar Google Calendar"
   - Autorize o aplicativo no popup do Google
   - Status mudará para "Conectado"

2. **Criar Agendamentos**:
   - Crie agendamentos normalmente no sistema
   - Se conectado ao Google Calendar, eventos serão criados automaticamente
   - Você receberá lembretes conforme configurado

3. **Desconectar**:
   - Na página de Agendamentos, clique em "Desconectar"
   - Futuros agendamentos não serão mais sincronizados

### 2. Para Desenvolvedores

#### Backend

**Rotas disponíveis**:

```javascript
// Obter URL de autorização
GET /api/google-calendar/auth-url

// Processar callback de autorização  
POST /api/google-calendar/callback

// Verificar status da conexão
GET /api/google-calendar/status

// Desconectar Google Calendar
POST /api/google-calendar/disconnect

// Listar eventos do Google Calendar
GET /api/google-calendar/events
```

**Integração com Agendamentos**:

O controller de agendamentos (`agendamentoController.js`) automaticamente:
- Verifica se o usuário tem Google Calendar conectado
- Cria eventos no Google Calendar quando agendamentos são criados
- Salva o ID do evento do Google para futuras referências

#### Frontend

**Hook disponível**:

```javascript
import { useGoogleCalendar } from '../hooks/useGoogleCalendar';

const { 
  loading, 
  connected, 
  error, 
  connectGoogle, 
  disconnect, 
  getEvents 
} = useGoogleCalendar();
```

**Componente pronto**:

```jsx
import GoogleCalendarConnect from '../components/GoogleCalendarConnect';

// Use em qualquer lugar onde quiser mostrar o status/botão de conexão
<GoogleCalendarConnect />
```

## Estrutura do Banco de Dados

### Campos adicionados na tabela `usuarios`:

- `googleAccessToken` (TEXT): Token de acesso do Google
- `googleRefreshToken` (TEXT): Token de refresh para renovar acesso  
- `googleCalendarConnected` (BOOLEAN): Status da conexão

### Campo adicionado na tabela `agendamentos`:

- `googleEventId` (VARCHAR): ID do evento no Google Calendar

## Fluxo de Funcionamento

1. **Conexão Inicial**:
   ```
   Usuário clica "Conectar" → Popup Google OAuth → Autorização → 
   Tokens salvos no banco → Status atualizado para "conectado"
   ```

2. **Criação de Agendamento**:
   ```
   Agendamento criado no sistema → Verifica se usuário conectado → 
   Cria evento no Google Calendar → Salva ID do evento
   ```

3. **Lembretes Automáticos**:
   - Google Calendar envia lembretes conforme configurado no evento
   - Emails automáticos 1 dia antes
   - Notificações popup 1 hora antes

## Troubleshooting

### Erro: "OAuth client ID not found"
- Verifique se `GOOGLE_CLIENT_ID` está correto no `.env`
- Confirme se o projeto está ativo no Google Cloud Console

### Erro: "Redirect URI mismatch"
- Verifique se a URL de redirect está correta nas configurações OAuth
- Confirme se `GOOGLE_REDIRECT_URI` no `.env` está correto

### Erro: "Calendar API not enabled"
- Ative a Google Calendar API no Google Cloud Console
- Aguarde alguns minutos para propagação

### Eventos não aparecem no Google Calendar
- Verifique se o token de acesso não expirou
- Confirme se o usuário tem permissão no calendário
- Verifique logs do backend para erros específicos

## Segurança

- ✅ Tokens são armazenados de forma segura no banco de dados
- ✅ Comunicação via HTTPS recomendada em produção
- ✅ Tokens de refresh permitem renovação automática
- ✅ Usuários podem desconectar a qualquer momento

## Próximos Passos

Para produção, considere:

1. **HTTPS**: Configure SSL/TLS
2. **Domínio**: Atualize URLs de redirect
3. **Verificação**: Submeta app para verificação Google (se necessário)
4. **Monitoramento**: Implemente logs detalhados
5. **Rate Limiting**: Configure limites de API
