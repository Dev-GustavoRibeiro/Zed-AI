# 📧 Templates de Email do ZED

## Como configurar no Supabase Dashboard

### Passo 1: Acessar o painel de Email Templates
1. Acesse o [Dashboard do Supabase](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá para **Authentication** → **Email Templates**

### Passo 2: Configurar cada template

---

## 📬 Confirm Signup (Confirmação de Cadastro)

**Assunto:**
```
Confirme seu cadastro no ZED ✨
```

**Corpo do email:**
Copie o conteúdo do arquivo `confirm-signup.html`

---

## 🔗 Magic Link

**Assunto:**
```
Seu link mágico para o ZED 🚀
```

**Corpo do email:**
Copie o conteúdo do arquivo `magic-link.html`

---

## 🔐 Reset Password (Redefinir Senha)

**Assunto:**
```
Redefinir sua senha no ZED 🔑
```

**Corpo do email:**
Copie o conteúdo do arquivo `reset-password.html`

---

## 📝 Variáveis disponíveis

| Variável | Descrição |
|----------|-----------|
| `{{ .ConfirmationURL }}` | URL de confirmação |
| `{{ .Token }}` | Código OTP de 6 dígitos |
| `{{ .TokenHash }}` | Hash do token |
| `{{ .SiteURL }}` | URL do seu site |
| `{{ .Email }}` | Email do usuário |
| `{{ .Data.name }}` | Nome do usuário (metadata) |

---

## ⚙️ Configurações Recomendadas

### URL Configuration
Em **Authentication** → **URL Configuration**:

- **Site URL:** `https://seu-dominio.com` (ou `http://localhost:3000` para dev)
- **Redirect URLs:** Adicione:
  - `http://localhost:3000/**`
  - `https://seu-dominio.com/**`

### Email Settings
Em **Authentication** → **Providers** → **Email**:

- ✅ Enable Email Confirmations (Habilitar confirmação de email)
- ✅ Secure email change (Alteração segura de email)

---

## 🎨 Personalizações

Os templates usam o design system do ZED:
- **Cores:** Azul (#3B82F6), Dourado (#F59E0B), Slate (#111827)
- **Bordas:** Arredondadas (12-24px)
- **Sombras:** Glow suave nas cores de destaque

Se quiser personalizar, mantenha a estrutura de tabelas para garantir compatibilidade com todos os clientes de email.

---

## 🔧 Testando

1. Crie uma conta nova no seu app
2. Verifique se o email chegou com o design correto
3. Teste em diferentes clientes de email (Gmail, Outlook, Apple Mail)

---

**Dica:** Os emails são renderizados usando tabelas HTML para máxima compatibilidade. Evite usar CSS moderno como flexbox ou grid.

