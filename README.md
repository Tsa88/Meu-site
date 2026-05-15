# 🛍️ ShopDrop — Loja de Dropshipping

Site completo de e-commerce para dropshipping com pagamento via PIX, painel administrativo e layout profissional. Pronto para hospedar no GitHub Pages.

---

## 🚀 Como publicar no GitHub Pages

Este repositório já está pronto para deploy automático com GitHub Actions.

1. Envie os arquivos para a branch `main` (ou `master`)
2. No GitHub, vá em **Settings → Pages**
3. Em **Source**, selecione **GitHub Actions**
4. Aguarde a execução do workflow **Deploy site no GitHub Pages**
5. Seu site ficará disponível em:
   `https://seuusuario.github.io/nome-do-repositorio/`

---

## ⚙️ Configuração Inicial (OBRIGATÓRIO)

Abra o arquivo `app.js` e edite o bloco no topo:

```javascript
const STORE_CONFIG = {
  name: "ShopDrop",               // Nome da sua loja
  pixKey: "sua@chave.pix",        // ← SUA CHAVE PIX
  email: "suporte@sualoja.com",   // E-mail de suporte
  whatsapp: "5511999999999",      // WhatsApp (só números)
};
```

---

## 🛒 Como Adicionar Produtos

**Método 1 — Pelo arquivo app.js** (recomendado para muitos produtos):

Localize o array `PRODUCTS` no arquivo `app.js` e adicione blocos como este:

```javascript
{
  id: 31,               // ← número único, não repita
  name: "Nome do Produto",
  price: 99.90,         // preço de venda
  origPrice: 149.90,    // preço riscado (opcional)
  img: "https://link-da-imagem.jpg",
  desc: "Descrição do produto aqui."
},
```

**Método 2 — Pelo Painel Administrativo** (mais fácil):

Acesse `seusite.com/?admin=1` para abrir o painel e adicionar produtos visualmente. As alterações são salvas automaticamente no navegador do visitante.

> ⚠️ Atenção: O painel admin usa `localStorage`. Alterações feitas via painel **não** são salvas no código-fonte. Para mudanças permanentes, edite o `app.js`.

---

## 📦 Estrutura de Arquivos

```
/
├── index.html   → estrutura das páginas
├── style.css    → todo o visual e layout
├── app.js       → lógica, produtos, carrinho, checkout
└── README.md    → este guia
```

---

## 💳 Fluxo de Pagamento PIX

1. Cliente escolhe produto → "Comprar" ou "Adicionar ao Carrinho"
2. Vai para checkout → preenche Nome, CPF e E-mail
3. Clica "Confirmar Pedido" → a chave PIX é exibida
4. Cliente paga via PIX no app do banco
5. E-mail de confirmação é enviado automaticamente
6. Lojista confirma pagamento e envia o produto em até 4h

---

## 📧 E-mail Automático

O site usa `mailto:` para abrir o cliente de e-mail com o template preenchido. Para e-mails automáticos em segundo plano (sem abrir programa), integre com:

- **[EmailJS](https://www.emailjs.com/)** — gratuito, sem backend
- **[Formspree](https://formspree.io/)** — simples de configurar
- Backend Node.js/Python com SendGrid ou Nodemailer

---

## 🔧 Personalização Rápida

| O que mudar | Onde |
|---|---|
| Cores do site | `style.css` → variáveis `:root` |
| Nome e logo | `index.html` → classe `.logo-text` |
| Chave PIX | `app.js` → `STORE_CONFIG.pixKey` |
| Produtos | `app.js` → array `PRODUCTS` |
| Número do WhatsApp | `app.js` → `STORE_CONFIG.whatsapp` |

---

## 🎨 Paleta de Cores (CSS Variables)

```css
--bg: #0a0a0f          /* fundo principal */
--accent: #e8ff47      /* amarelo-neon (destaque) */
--accent2: #7c3aed     /* roxo (efeitos) */
--accent3: #06d6a0     /* verde (confirmações) */
```

---

© 2025 ShopDrop. Todos os direitos reservados.
