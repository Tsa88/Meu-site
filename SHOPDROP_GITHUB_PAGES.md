# 🚀 ShopDrop - Deploy no GitHub Pages

Guia completo para fazer deploy do ShopDrop no GitHub Pages do repositório `Tsa88/Meu-site`.

---

## 📋 Visão Geral

O ShopDrop foi desenvolvido no Manus WebDev e agora será integrado ao seu repositório GitHub para deploy automático via GitHub Pages.

**O que você terá:**
- ✅ Loja online completa com React 19 + Tailwind CSS
- ✅ Painel admin para gerenciar produtos e pedidos
- ✅ Integração com Google Sheets (banco de dados gratuito)
- ✅ Envio automático de e-mails com EmailJS
- ✅ Pagamento via PIX
- ✅ Deploy automático com GitHub Actions

---

## 🎯 Passo 1: Exportar do Manus WebDev

### Opção A: Usar o Painel de Gerenciamento (Recomendado)

1. Acesse o painel do Manus: https://manus.im
2. Vá para o projeto "shopdrop-site"
3. Clique em **"Code"** (painel de código)
4. Clique em **"Download all files"** ou use o botão **"⋯ More"** → **"Download as ZIP"**
5. Extraia o arquivo ZIP

### Opção B: Usar GitHub CLI

```bash
# Clonar o repositório do Manus (se tiver acesso)
gh repo clone Tsa88/Meu-site
cd Meu-site
```

---

## 📦 Passo 2: Copiar Arquivos para o Repositório GitHub

Após exportar, copie os arquivos principais:

```bash
# Supondo que você extraiu em ~/Downloads/shopdrop-site
cd ~/Downloads/shopdrop-site

# Copiar para o repositório GitHub
cp -r client ~/Meu-site/
cp -r .github ~/Meu-site/
cp -r scripts ~/Meu-site/
cp vite.config.ts ~/Meu-site/
cp tsconfig.json ~/Meu-site/
cp tsconfig.node.json ~/Meu-site/
cp package.json ~/Meu-site/
cp pnpm-lock.yaml ~/Meu-site/

# Copiar documentação
cp DEPLOY.md ~/Meu-site/DEPLOY_SHOPDROP.md
cp ENV_SETUP.md ~/Meu-site/ENV_SETUP_SHOPDROP.md
cp README_COMPLETE.md ~/Meu-site/README_SHOPDROP.md
```

---

## 🔧 Passo 3: Configurar Variáveis de Ambiente

### 3.1 Criar `.env.local` (Desenvolvimento Local)

```bash
cd ~/Meu-site
cat > .env.local << 'EOF'
# SheetDB Configuration
VITE_SHEETDB_URL=https://api.sheetdb.io/v1/[SEU_ID]

# EmailJS Configuration
VITE_EMAILJS_SERVICE_ID=service_xxxxxxxxxxxxx
VITE_EMAILJS_TEMPLATE_ID=template_xxxxxxxxxxxxx
VITE_EMAILJS_PUBLIC_KEY=xxxxxxxxxxxxxxxxxxxxxxxx

# Admin Configuration
VITE_ADMIN_PASSWORD=sua_senha_forte

# PIX Configuration
VITE_PIX_KEY=22675947000135

# Support Contact
VITE_SUPPORT_EMAIL=tsa.albuquerque88@gmail.com
VITE_SUPPORT_WHATSAPP=75 99210-1434

# GitHub Pages
GITHUB_PAGES=false
EOF
```

### 3.2 Configurar SheetDB

1. Acesse [sheetdb.io](https://sheetdb.io)
2. Crie uma conta
3. Crie um novo dataset com Google Sheets
4. Estrutura recomendada:

```
| id | name | price | originalPrice | image | description |
|----|------|-------|----------------|-------|-------------|
| 1 | Produto 1 | 99.90 | 149.90 | https://... | Descrição |
```

5. Copie a URL da API para `VITE_SHEETDB_URL`

### 3.3 Configurar EmailJS

1. Acesse [emailjs.com](https://www.emailjs.com)
2. Crie uma conta
3. Conecte um serviço de e-mail (Gmail, Outlook, etc)
4. Crie um template com variáveis:
   - `{{customer_name}}`
   - `{{customer_email}}`
   - `{{order_id}}`
   - `{{order_items}}`
   - `{{order_total}}`
   - `{{pix_key}}`

5. Copie os IDs para `.env.local`

---

## 📝 Passo 4: Instalar Dependências

```bash
cd ~/Meu-site

# Instalar pnpm (se não tiver)
npm install -g pnpm

# Instalar dependências
pnpm install
```

---

## 🧪 Passo 5: Testar Localmente

```bash
# Desenvolvimento
pnpm dev

# Build para produção
pnpm build

# Preview do build
pnpm preview
```

Acesse:
- **Loja**: http://localhost:3000
- **Admin**: http://localhost:3000/admin (senha: sua_senha_forte)

---

## 🔄 Passo 6: Fazer Commit e Push

```bash
cd ~/Meu-site

# Adicionar todos os arquivos
git add -A

# Fazer commit
git commit -m "ShopDrop v1.0 - Deploy para GitHub Pages com React 19, Google Sheets e EmailJS"

# Fazer push
git push origin main
```

---

## ⚙️ Passo 7: Ativar GitHub Pages

1. Acesse: https://github.com/Tsa88/Meu-site/settings/pages
2. Em "Build and deployment":
   - **Source**: GitHub Actions
   - **Branch**: main
3. Salve

---

## ✅ Passo 8: Verificar Deploy

1. Vá para **Actions** no repositório
2. Acompanhe o workflow `Build and Deploy to GitHub Pages`
3. Após conclusão (✓), acesse: https://Tsa88.github.io/Meu-site

---

## 🔐 Passo 9: Configurar GitHub Secrets (Produção)

Para segurança em produção, use GitHub Secrets:

```bash
# Adicionar secrets
gh secret set VITE_SHEETDB_URL -b "https://api.sheetdb.io/v1/xxxxx"
gh secret set VITE_EMAILJS_SERVICE_ID -b "service_xxxxx"
gh secret set VITE_EMAILJS_TEMPLATE_ID -b "template_xxxxx"
gh secret set VITE_EMAILJS_PUBLIC_KEY -b "xxxxxxxx"
gh secret set VITE_ADMIN_PASSWORD -b "sua_senha_forte"
```

Depois, edite `.github/workflows/deploy.yml` para usar os secrets:

```yaml
env:
  VITE_SHEETDB_URL: ${{ secrets.VITE_SHEETDB_URL }}
  VITE_EMAILJS_SERVICE_ID: ${{ secrets.VITE_EMAILJS_SERVICE_ID }}
  # ... etc
```

---

## 📊 Estrutura Final do Repositório

```
Meu-site/
├── client/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.tsx (Loja)
│   │   │   ├── Admin.tsx (Painel Admin)
│   │   │   └── NotFound.tsx
│   │   ├── components/
│   │   │   ├── Header.tsx
│   │   │   ├── ProductCard.tsx
│   │   │   ├── CartDrawer.tsx
│   │   │   ├── CheckoutModal.tsx
│   │   │   └── ui/ (shadcn/ui)
│   │   ├── hooks/
│   │   │   ├── useProducts.ts
│   │   │   ├── useOrders.ts
│   │   │   └── useEmailJS.ts
│   │   ├── App.tsx
│   │   └── index.css
│   ├── index.html
│   └── public/
├── .github/
│   └── workflows/
│       └── deploy.yml (CI/CD)
├── scripts/
│   ├── setup.mjs
│   └── deploy-to-github.sh
├── vite.config.ts
├── tsconfig.json
├── package.json
├── pnpm-lock.yaml
├── DEPLOY_SHOPDROP.md
├── ENV_SETUP_SHOPDROP.md
├── README_SHOPDROP.md
├── .env.local (não commitar)
└── .gitignore
```

---

## 🚨 Troubleshooting

### Erro: "Dependências não instaladas"

```bash
pnpm install --frozen-lockfile
```

### Erro: "Build falha localmente"

```bash
# Limpar cache
rm -rf node_modules .pnpm-store
pnpm install
pnpm build
```

### Erro: "GitHub Pages não ativa"

1. Verifique se GitHub Actions está habilitado
2. Vá para Settings → Actions → General
3. Selecione "Allow all actions and reusable workflows"

### Admin não carrega

1. Limpe localStorage: `localStorage.clear()`
2. Verifique se `.env.local` tem `GITHUB_PAGES=false` (desenvolvimento)
3. Recarregue a página

### Produtos não carregam

1. Verifique se `VITE_SHEETDB_URL` está correto
2. Teste a URL no navegador: `https://api.sheetdb.io/v1/[SEU_ID]`
3. Certifique-se de que o dataset tem dados

---

## 📞 Suporte

- **E-mail**: tsa.albuquerque88@gmail.com
- **WhatsApp**: 75 99210-1434

---

## ✨ Próximas Melhorias

- [ ] Integração com Stripe/Mercado Pago
- [ ] Sistema de cupons de desconto
- [ ] Histórico de pedidos do cliente
- [ ] Notificações em tempo real
- [ ] Dashboard com gráficos de vendas
- [ ] Integração com WhatsApp Business

---

**Versão**: 1.0.0
**Última atualização**: 2026-05-18
**Desenvolvido com ❤️ para ShopDrop**
