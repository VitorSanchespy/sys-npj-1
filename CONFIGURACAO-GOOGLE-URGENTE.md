# 🚨 CONFIGURAÇÃO URGENTE - Google OAuth

## Problema Atual
**Erro 400: redirect_uri_mismatch** - A URL de redirect não está configurada corretamente no Google Cloud Console.

## ✅ Solução Imediata

### 1. Acesse o Google Cloud Console
- Vá para: https://console.cloud.google.com/
- Selecione seu projeto ou crie um novo

### 2. Configure OAuth 2.0
1. Vá para **APIs & Services** > **Credentials**
2. Clique no seu **OAuth 2.0 Client ID** existente (ou crie um novo)
3. Em **Authorized redirect URIs**, adicione:
   ```
   http://localhost:5173/auth/google/callback
   ```
4. Clique em **Save**

### 3. Verifique se a Google Calendar API está ativada
1. Vá para **APIs & Services** > **Library**
2. Procure por "Google Calendar API"
3. Clique em **Enable** se não estiver ativada

## 🔧 Configurações Atuais do Sistema

### Backend (.env):
```
GOOGLE_CLIENT_ID=921711622251-7pdm73fmkajdr7c0p0ouh6espcafn1tl.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
GOOGLE_REDIRECT_URI=http://localhost:5173/auth/google/callback
```

### URLs que devem estar no Google Cloud Console:
- **Authorized JavaScript origins**: `http://localhost:5173`
- **Authorized redirect URIs**: `http://localhost:5173/auth/google/callback`

## 🧪 Teste Rápido

Após configurar no Google Cloud Console:

1. Acesse: http://localhost:5173
2. Faça login no sistema
3. Vá para /agendamentos
4. Clique em "Conectar Google Calendar"
5. Deve redirecionar para Google sem erro 400

## 📞 Se Ainda Houver Problema

Execute este comando para debug:
```bash
node test-google-routes.js
```

Ou acesse diretamente a URL de auth para ver a mensagem de erro:
http://localhost:3001/api/google-calendar/auth-url (com token de autenticação)

---

**⚠️ IMPORTANTE**: O Google Cloud Console pode levar alguns minutos para propagar as mudanças. Se ainda houver erro, aguarde 5-10 minutos e teste novamente.
