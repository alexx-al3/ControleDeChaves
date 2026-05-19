# 🔑 ACRC Imóveis — Controle de Chaves v4.0

Sistema completo de controle de chaves com perfis de usuário, assinatura digital, histórico por chave, relatórios automáticos por email e auditoria total.

---

## 🚀 Deploy no Vercel

### Passo 1 — Repositório GitHub
1. Acesse **github.com** → **New repository** → nome: `acrc-chaves`
2. Clique em **"uploading an existing file"**
3. Faça upload de **todos** os arquivos desta pasta:
   - `index.html`
   - `manifest.json`
   - `vercel.json`
   - `package.json`
   - `api/send-email.js`
4. Clique **Commit changes**

### Passo 2 — Deploy no Vercel
1. Acesse **vercel.com/new**
2. Importe o repositório `acrc-chaves`
3. Clique **Deploy**
4. Em ~60 segundos você recebe a URL pública

---

## 👥 Usuários padrão

| Usuário    | Senha       | Perfil    |
|------------|-------------|-----------|
| `cadastro` | `acrc@2024` | Cadastro  |
| `adm`      | `adm@2024`  | ADM       |
| `corretor` | `cor@2024`  | Corretor  |

> ⚠️ **Altere as senhas no primeiro acesso** pelo perfil Cadastro → Admin → Config

---

## 🔒 Permissões por perfil

| Funcionalidade         | Corretor | ADM | Cadastro |
|------------------------|:--------:|:---:|:--------:|
| Ver chaves             | ✅       | ✅  | ✅       |
| Editar chave           | ✅*      | ✅  | ✅       |
| Registrar foto         | ✅       | ✅  | ✅       |
| Datas de saída/retorno | ✅       | ✅  | ✅       |
| Gerar PDF              | ❌       | ✅  | ✅       |
| Assinatura digital     | ❌       | ✅  | ✅       |
| Gerenciar chaves       | ❌       | ✅  | ✅       |
| Gerenciar usuários     | ❌       | ❌  | ✅       |
| Ver histórico          | ❌       | ✅  | ✅       |
| Configurações          | ❌       | ✅  | ✅       |

*Corretor: não edita código do imóvel nem observações

---

## ✉️ Configurar email automático (quando quiser)

### No Google
1. Acesse **myaccount.google.com → Segurança**
2. Ative **Verificação em duas etapas**
3. Vá em **Senhas de app** → Gerar → nome `ACRC Chaves`
4. Anote a senha de 16 caracteres

### No Vercel
1. Vá em **Settings → Environment Variables**
2. Adicione:
   - `GMAIL_USER` → `seuemail@gmail.com`
   - `GMAIL_PASS` → `senha-de-16-caracteres`
   - `EMAIL_DEST` → `destinatario@acrcimoveis.com.br`
3. Clique **Redeploy**

Pronto! Todo salvamento enviará relatório automático por email.

---

## 🗄️ Conectar Supabase (banco de dados compartilhado)

### No Supabase
1. Acesse **supabase.com** → **New project**
2. Anote a **URL** e a **anon key** (em Settings → API)
3. No SQL Editor, execute:

```sql
-- Tabela de chaves
CREATE TABLE keys (
  id TEXT PRIMARY KEY,
  loc TEXT NOT NULL,
  codigo TEXT DEFAULT '',
  status TEXT DEFAULT 'LIVRE',
  responsavel TEXT DEFAULT '',
  data_ret TEXT DEFAULT '',
  data_dev TEXT DEFAULT '',
  obs TEXT DEFAULT '',
  foto TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de histórico
CREATE TABLE history (
  id BIGINT PRIMARY KEY DEFAULT extract(epoch from now())*1000,
  tipo TEXT,
  loc TEXT,
  codigo TEXT,
  responsavel TEXT,
  status TEXT,
  ts TIMESTAMPTZ DEFAULT NOW(),
  usuario TEXT,
  perfil TEXT,
  changes JSONB,
  extra JSONB
);

-- Tabela de usuários
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT,
  user_login TEXT UNIQUE,
  pass TEXT,
  role TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS (Row Level Security) - básico
ALTER TABLE keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE history ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: permite tudo com anon key (ajuste conforme necessidade)
CREATE POLICY "allow_all" ON keys FOR ALL USING (true);
CREATE POLICY "allow_all" ON history FOR ALL USING (true);
CREATE POLICY "allow_all" ON users FOR ALL USING (true);
```

### No index.html
Substitua no início do `<script>`:
```javascript
const SUPA_URL = "https://xxxx.supabase.co";   // sua URL
const SUPA_KEY = "eyJ...";                       // sua anon key
```

O app detecta automaticamente e começa a usar o Supabase como banco.

---

## 📱 Instalar como app no celular

**iPhone/iPad:** Safari → Compartilhar → "Adicionar à Tela de Início"  
**Android:** Chrome → Menu (⋮) → "Adicionar à tela inicial"

---

## 📁 Estrutura do projeto

```
acrc-chaves/
├── index.html          ← App completo
├── manifest.json       ← PWA config
├── vercel.json         ← Deploy config
├── package.json        ← Dependências (Nodemailer)
├── api/
│   └── send-email.js   ← Backend email (Vercel Function)
└── README.md
```

---

## 🔄 Regras de status automáticas

| Ação                          | Status resultante |
|-------------------------------|:-----------------:|
| Nova chave cadastrada         | LIVRE             |
| Código do imóvel preenchido   | DISPONÍVEL        |
| PDF gerado (temporário)       | INDISPONÍVEL      |
| PDF Definitivo/Novo Locatário | LIVRE (limpa dados) |
| Devolução registrada          | DISPONÍVEL/LIVRE  |

---

