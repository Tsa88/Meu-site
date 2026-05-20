/* =========================================================================
   SHOPDROP app.js - Lógica Completa e Integrada (VERSÃO ATUALIZADA)
   ========================================================================= */

// CONFIGURAÇÕES PADRÃO DO SISTEMA - ATUALIZADO COM SEUS DADOS
const STORE_CONFIG = {
    name: "ShopDrop",
    pixKey: "tsa.albuquerque88@gmail.com", // Coloquei seu e-mail como chave PIX (mude se for outra)
    email: "tsa.albuquerque88@gmail.com",
    whatsapp: "5575992101434", // Formato internacional para funcionar o link
};

// CONFIGURAÇÃO INICIAL DO EMAILJS
const EMAILJS_CONFIG = {
    publicKey: "SUA_PUBLIC_KEY_AQUI",
    serviceId: "SEU_SERVICE_ID_AQUI",
    templateCliente: "SEU_TEMPLATE_CLIENTE_ID",
    templateLojista: "SEU_TEMPLATE_LOJISTA_ID"
};

// ARRAY DE PRODUTOS (Exemplo de como adicionar)
let PRODUCTS = [
    {
        id: 1,
        name: "Produto Exemplo ShopDrop",
        price: 99.90,
        origPrice: 149.90,
        img: "https://placehold.co/400x400/1a1a24/e8ff47?text=ShopDrop",
        desc: "Este é um produto de exemplo. Adicione os seus reais no app.js!"
    }
];

// ESTADO GLOBAL
let cart = [];
let currentModal = null;
let modalQty = 1;

// INICIALIZAÇÃO
document.addEventListener("DOMContentLoaded", () => {
    // Forçar limpeza de cache de configurações antigas no primeiro carregamento
    if (!localStorage.getItem("config_reset_v2")) {
        localStorage.removeItem("shopDrop_config");
        localStorage.setItem("config_reset_v2", "true");
    }

    loadFromStorage();
    renderProducts(PRODUCTS);
    renderAdminList();
    
    // Atualiza os textos de contato no HTML com os dados do JS
    applyConfigToUI();

    if (window.location.search.includes("admin=1")) {
        showAdminPanel();
    }

    window.addEventListener("scroll", () => {
        const header = document.getElementById("header");
        if (header) {
            header.style.boxShadow = window.scrollY > 20 ? "0 4px 30px rgba(0,0,0,0.5)" : "none";
        }
    });
});

// FUNÇÃO PARA GARANTIR QUE OS DADOS APAREÇAM NA TELA
function applyConfigToUI() {
    const emailEl = document.getElementById("contactEmail");
    const whatsEl = document.getElementById("contactWhatsApp");
    
    if (emailEl) {
        emailEl.textContent = STORE_CONFIG.email;
        emailEl.href = `mailto:${STORE_CONFIG.email}`;
    }
    if (whatsEl) {
        const whatsappDigits = String(STORE_CONFIG.whatsapp || "").replace(/\D/g, "");
        const localNumber = whatsappDigits.startsWith("55") ? whatsappDigits.slice(2) : whatsappDigits;
        if (localNumber.length === 11) {
            whatsEl.textContent = `(${localNumber.slice(0, 2)}) ${localNumber.slice(2, 7)}-${localNumber.slice(7)}`;
        } else {
            whatsEl.textContent = STORE_CONFIG.whatsapp;
        }
    }
}

// PERSISTÊNCIA (localStorage)
function saveToStorage() {
    try {
        localStorage.setItem("shopDrop_products", JSON.stringify(PRODUCTS));
        localStorage.setItem("shopDrop_config", JSON.stringify(STORE_CONFIG));
        localStorage.setItem("shopDrop_emailjs", JSON.stringify(EMAILJS_CONFIG));
        localStorage.setItem("shopDrop_cart", JSON.stringify(cart));
    } catch(e) { 
        console.warn("LocalStorage não disponível:", e); 
    }
}

function loadFromStorage() {
    try {
        const p = localStorage.getItem("shopDrop_products");
        if (p) PRODUCTS = JSON.parse(p);

        const c = localStorage.getItem("shopDrop_config");
        if (c) {
            const cfg = JSON.parse(c);
            Object.assign(STORE_CONFIG, cfg);
        }

        const ejs = localStorage.getItem("shopDrop_emailjs");
        if (ejs) {
            const ejsCfg = JSON.parse(ejs);
            Object.assign(EMAILJS_CONFIG, ejsCfg);
        }

        const cart_ = localStorage.getItem("shopDrop_cart");
        if (cart_) {
            cart = JSON.parse(cart_);
            updateCartUI();
        }
    } catch(e) { 
        console.warn("Erro ao carregar storage:", e); 
    }
}

// RENDERIZAÇÃO DE PRODUTOS
function renderProducts(list) {
    const grid = document.getElementById("productsGrid");
    const noResults = document.getElementById("noResults");
    if (!grid) return;

    if (!list || list.length === 0) {
        grid.innerHTML = "";
        if (noResults) noResults.style.display = "block";
        return;
    }

    if (noResults) noResults.style.display = "none";

    grid.innerHTML = list.map((p, i) => {
        let badgeHtml = "";
        let discountHtml = "";

        if (p.origPrice && p.origPrice > p.price) {
            const disc = Math.round((1 - p.price / p.origPrice) * 100);
            badgeHtml = `<div class="product-badge">-${disc}%</div>`;
            discountHtml = `
                <span class="product-orig-price">${formatPrice(p.origPrice)}</span>
            `;
        }

        return `
            <div class="product-card" style="animation-delay: ${i * 0.04}s" onclick="openModal(${p.id})">
                ${badgeHtml}
                <div class="product-img-wrap">
                    <img src="${p.img}" alt="${escapeHtml(p.name)}" loading="lazy" onerror="this.src='https://placehold.co/400x400/1a1a24/e8ff47?text=Produto'" />
                </div>
                <div class="product-info">
                    <div class="product-name">${escapeHtml(p.name)}</div>
                    <div class="product-price-row">
                        <span class="product-price">${formatPrice(p.price)}</span>
                        ${discountHtml}
                    </div>
                    <div class="product-actions">
                        <button class="btn-add-cart" onclick="event.stopPropagation(); addToCart(${p.id})">+ Carrinho</button>
                        <button class="btn-buy-now" onclick="event.stopPropagation(); buyNow(${p.id})">Comprar</button>
                    </div>
                </div>
            </div>`;
    }).join("");
}

// BUSCA E FILTRO
function filterProducts() {
    const q = document.getElementById("searchInput")?.value.toLowerCase().trim() || "";
    const filtered = q === "" ? PRODUCTS : PRODUCTS.filter(p => p.name.toLowerCase().includes(q));
    renderProducts(filtered);
}

// CARRINHO DE COMPRAS
function addToCart(productId, qty = 1) {
    const p = PRODUCTS.find(x => x.id === productId);
    if (!p) return;

    const existing = cart.find(x => x.id === productId);
    if (existing) {
        existing.qty += qty;
    } else {
        cart.push({ id: p.id, name: p.name, price: p.price, img: p.img, qty: qty });
    }

    updateCartUI();
    saveToStorage();
    showToast(`Adicionado ao carrinho!`);
}

function buyNow(productId) {
    addToCart(productId);
    goToCheckout();
}

function removeFromCart(productId) {
    cart = cart.filter(x => x.id !== productId);
    updateCartUI();
    saveToStorage();
}

function changeCartQty(productId, delta) {
    const item = cart.find(x => x.id === productId);
    if (!item) return;

    item.qty = Math.max(1, item.qty + delta);
    updateCartUI();
    saveToStorage();
}

function clearCart() {
    cart = [];
    updateCartUI();
    saveToStorage();
}

function updateCartUI() {
    const badge = document.getElementById("cartBadge");
    const itemsEl = document.getElementById("cartItems");
    const footerEl = document.getElementById("cartFooter");
    const totalEl = document.getElementById("cartTotal");

    const totalItems = cart.reduce((sum, x) => sum + x.qty, 0);
    const totalValue = cart.reduce((sum, x) => sum + x.price * x.qty, 0);

    if (badge) badge.textContent = totalItems;

    if (!itemsEl) return;
    if (cart.length === 0) {
        itemsEl.innerHTML = `<div class="cart-empty">Seu carrinho está vazio</div>`;
        if (footerEl) footerEl.style.display = "none";
        return;
    }

    if (footerEl) footerEl.style.display = "block";
    if (totalEl) totalEl.textContent = formatPrice(totalValue);

    itemsEl.innerHTML = cart.map(item => `
        <div class="cart-item">
            <img class="cart-item-img" src="${item.img}" alt="${escapeHtml(item.name)}" onerror="this.src='https://placehold.co/60x60/1a1a24/e8ff47?text=?'" />
            <div class="cart-item-info">
                <div class="cart-item-name">${escapeHtml(item.name)}</div>
                <div class="cart-item-price">${formatPrice(item.price)}</div>
                <div class="cart-item-controls">
                    <button onclick="changeCartQty(${item.id},-1)">-</button>
                    <span>${item.qty}</span>
                    <button onclick="changeCartQty(${item.id},1)">+</button>
                </div>
            </div>
            <button class="cart-item-remove" onclick="removeFromCart(${item.id})" title="Remover">X</button>
        </div>
    `).join("");
}

// GAVETA DO CARRINHO
function toggleCart() {
    const drawer = document.getElementById("cartDrawer");
    const overlay = document.getElementById("cartOverlay");
    if (!drawer || !overlay) return;

    const open = drawer.classList.contains("open");
    drawer.classList.toggle("open", !open);
    overlay.classList.toggle("open", !open);
    document.body.style.overflow = open ? "" : "hidden";
}

// MODAL DO PRODUTO (QUICK VIEW)
function openModal(productId) {
    const p = PRODUCTS.find(x => x.id === productId);
    if (!p) return;

    currentModal = p;
    modalQty = 1;

    document.getElementById("modalImg").src = p.img;
    document.getElementById("modalName").textContent = p.name;
    document.getElementById("modalPrice").textContent = formatPrice(p.price);
    document.getElementById("modalDesc").textContent = p.desc || "Produto selecionado com excelente custo-benefício.";
    document.getElementById("modalQty").textContent = 1;

  document.getElementById("modalOverlay").classList.add("open");
  document.getElementById("productModal").classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  document.getElementById("modalOverlay").classList.remove("open");
  document.getElementById("productModal").classList.remove("open");
  document.body.style.overflow = "";
  currentModal = null;
}

function changeQty(delta) {
  modalQty = Math.max(1, modalQty + delta);
  document.getElementById("modalQty").textContent = modalQty;
}

function addFromModal() {
  if (!currentModal) return;
  addToCart(currentModal.id, modalQty);
  closeModal();
}

function buyFromModal() {
  if (!currentModal) return;
  addToCart(currentModal.id, modalQty);
  closeModal();
  goToCheckout();
}

// ============================================================
//  CHECKOUT
// ============================================================
function goToCheckout() {
  if (cart.length === 0) {
    showToast("⚠️ Carrinho está vazio!");
    return;
  }
  // Fecha o drawer do carrinho
  document.getElementById("cartDrawer").classList.remove("open");
  document.getElementById("cartOverlay").classList.remove("open");
  document.body.style.overflow = "";

  // Preenche resumo
  renderCheckoutSummary();

  // Esconde chave pix (aparece após confirmar)
  document.getElementById("pixKeyDisplay").style.display = "none";

  showPage("checkout");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderCheckoutSummary() {
  const el = document.getElementById("checkoutItems");
  if (!el) return;

  const total = cart.reduce((sum, x) => sum + x.price * x.qty, 0);

  el.innerHTML = cart.map(item => `
    <div class="checkout-summary-item">
      <img src="${item.img}" alt="${escapeHtml(item.name)}"
           onerror="this.src='https://placehold.co/50x50/1a1a24/e8ff47?text=?'" />
      <div class="checkout-summary-item-info">
        <span>${escapeHtml(item.name)}</span>
        <small>Qtd: ${item.qty}</small>
      </div>
      <span class="checkout-summary-item-price">${formatPrice(item.price * item.qty)}</span>
    </div>
  `).join("");

  document.getElementById("summarySubtotal").textContent = formatPrice(total);
  document.getElementById("summaryTotal").textContent = formatPrice(total);
}

// ============================================================
//  CONFIRMAR PEDIDO
// ============================================================
async function confirmOrder() {
  const nome  = document.getElementById("chkNome")?.value.trim();
  const cpf   = document.getElementById("chkCpf")?.value.trim();
  const email = document.getElementById("chkEmail")?.value.trim();

  // Validações
  if (!nome || nome.length < 3) { showToast("⚠️ Digite seu nome completo!"); return; }
  if (!cpf || !validateCPF(cpf)) { showToast("⚠️ CPF inválido!"); return; }
  if (!email || !validateEmail(email)) { showToast("⚠️ E-mail inválido!"); return; }
  if (cart.length === 0) { showToast("⚠️ Carrinho está vazio!"); return; }

  const orderId = generateOrderId();
  const total   = cart.reduce((sum, x) => sum + x.price * x.qty, 0);

  // Bloqueia o botão e mostra loading
  const btn = document.querySelector(".confirm-btn");
  if (btn) { btn.disabled = true; btn.textContent = "⏳ Enviando confirmação..."; }

  // Mostra chave PIX imediatamente
  document.getElementById("pixKeyValue").textContent = STORE_CONFIG.pixKey;
  document.getElementById("pixKeyDisplay").style.display = "block";

  // Dispara e-mails via EmailJS (assíncrono)
  const emailOk = await sendConfirmationEmail(nome, email, orderId, total);

  // Restaura o botão
  if (btn) { btn.disabled = false; btn.textContent = "Confirmar Pedido & Ver PIX"; }

  // Preenche tela de confirmação
  document.getElementById("confirmOrderId").textContent = orderId;
  document.getElementById("confirmName").textContent = nome;
  document.getElementById("confirmEmail").textContent = email;
  document.getElementById("confirmPixKey").textContent = STORE_CONFIG.pixKey;
  document.getElementById("confirmMsg").textContent = emailOk
    ? `Olá, ${nome}! Confirmação enviada para ${email}. Realize o pagamento via PIX e seu produto será enviado em até 4h.`
    : `Olá, ${nome}! Pedido registrado. Verifique seu e-mail ou entre em contato conosco.`;

  showPage("confirm");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ============================================================
//  E-MAIL VIA EMAILJS
//
//  Esta função dispara dois e-mails simultâneos:
//    1. Para o CLIENTE → confirmação da compra com dados do PIX
//    2. Para o LOJISTA → notificação de novo pedido
//
//  O EmailJS é inicializado com a Public Key antes de cada envio,
//  o que permite que a chave seja atualizada em tempo real pelo
//  painel admin sem precisar recarregar a página.
//
//  Retorna true se pelo menos o e-mail do cliente foi enviado.
// ============================================================
async function sendConfirmationEmail(nome, email, orderId, total) {
  // Verifica se as credenciais foram configuradas
  if (!EMAILJS_CONFIG.publicKey || EMAILJS_CONFIG.publicKey === "SUA_PUBLIC_KEY_AQUI") {
    console.warn("EmailJS não configurado. Configure em ?admin=1 ou no app.js.");
    showToast("⚠️ E-mail não configurado. Pedido salvo!");
    return false;
  }

  // Monta lista de produtos formatada para o e-mail
  const produtosTexto = cart
    .map(x => `• ${x.name} (x${x.qty}) — ${formatPrice(x.price * x.qty)}`)
    .join("\n");

  const produtosHtml = cart
    .map(x => `<tr>
      <td style="padding:6px 8px;border-bottom:1px solid #eee">${x.name}</td>
      <td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:center">${x.qty}</td>
      <td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:right;font-weight:600">${formatPrice(x.price * x.qty)}</td>
    </tr>`)
    .join("");

  // Variáveis que serão injetadas nos templates do EmailJS.
  // Os nomes {{variavel}} no template devem bater com estas chaves.
  const templateParams = {
    // ─── Dados do cliente ───────────────────────────────
    to_name:       nome,
    to_email:      email,

    // ─── Dados do pedido ────────────────────────────────
    order_id:      orderId,
    order_total:   formatPrice(total),
    order_items:   produtosTexto,       // versão texto puro
    order_items_html: produtosHtml,     // versão HTML (tabela)
    order_date:    new Date().toLocaleString("pt-BR"),

    // ─── Dados de pagamento ─────────────────────────────
    pix_key:       STORE_CONFIG.pixKey,

    // ─── Dados da loja ──────────────────────────────────
    store_name:    STORE_CONFIG.name,
    store_email:   STORE_CONFIG.email,
    store_whatsapp: STORE_CONFIG.whatsapp,

    // ─── Para o template do lojista ─────────────────────
    lojista_email: STORE_CONFIG.email,
  };

  // Inicializa o EmailJS com a chave pública configurada
  // (chamamos init aqui para garantir que mudanças no admin surtam efeito)
  try { emailjs.init(EMAILJS_CONFIG.publicKey); }
  catch(e) {
    console.error("Erro ao inicializar EmailJS. Verifique se o script foi carregado:", e);
    showToast("❌ Erro no serviço de e-mail.");
    return false;
  }

  let clienteOk  = false;
  let lojistaOk  = false;

  // ── E-mail 1: para o CLIENTE ────────────────────────────────
  if (EMAILJS_CONFIG.templateCliente && EMAILJS_CONFIG.templateCliente !== "SEU_TEMPLATE_CLIENTE_ID") {
    try {
      await emailjs.send(
        EMAILJS_CONFIG.serviceId,
        EMAILJS_CONFIG.templateCliente,
        templateParams
      );
      clienteOk = true;
      console.log(`✅ E-mail de confirmação enviado para ${email}`);
    } catch(err) {
      console.error("Erro ao enviar e-mail para o cliente:", err);
      showToast("⚠️ Não foi possível enviar o e-mail de confirmação.");
    }
  } else {
    console.warn("Template do cliente não configurado.");
  }

  // ── E-mail 2: para o LOJISTA (notificação) ──────────────────
  if (EMAILJS_CONFIG.templateLojista && EMAILJS_CONFIG.templateLojista !== "SEU_TEMPLATE_LOJISTA_ID") {
    try {
      await emailjs.send(
        EMAILJS_CONFIG.serviceId,
        EMAILJS_CONFIG.templateLojista,
        { ...templateParams, to_email: STORE_CONFIG.email } // redireciona para o lojista
      );
      lojistaOk = true;
      console.log(`✅ Notificação enviada para o lojista: ${STORE_CONFIG.email}`);
    } catch(err) {
      // Não crítico — apenas avisa no console
      console.warn("Não foi possível enviar notificação ao lojista:", err);
    }
  }

  if (clienteOk) showToast("📧 E-mail de confirmação enviado!");
  return clienteOk;
}

// ============================================================
//  COPIAR CHAVE PIX
// ============================================================
function copyPixKey() {
  const key = STORE_CONFIG.pixKey;
  if (navigator.clipboard) {
    navigator.clipboard.writeText(key).then(() => showToast("✓ Chave PIX copiada!"));
  } else {
    // Fallback para navegadores antigos
    const el = document.createElement("textarea");
    el.value = key;
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
    showToast("✓ Chave PIX copiada!");
  }
}

// ============================================================
//  NAVEGAÇÃO DE PÁGINAS
// ============================================================
function showPage(page) {
  // Esconde tudo
  document.getElementById("page-home").style.display = "none";
  document.getElementById("page-checkout").style.display = "none";
  document.getElementById("page-confirm").style.display = "none";
  document.getElementById("adminPanel").style.display = "none";

  // Mostra a correta
  if (page === "home") {
    document.getElementById("page-home").style.display = "block";
  } else if (page === "checkout") {
    document.getElementById("page-checkout").style.display = "block";
  } else if (page === "confirm") {
    document.getElementById("page-confirm").style.display = "block";
  }
}

function showAdminPanel() {
  document.getElementById("page-home").style.display = "none";
  document.getElementById("page-checkout").style.display = "none";
  document.getElementById("page-confirm").style.display = "none";
  document.getElementById("adminPanel").style.display = "block";
  renderAdminList();

  // Preenche campos com dados atuais da loja
  const fields = {
    adminPixKey:    STORE_CONFIG.pixKey,
    adminEmail:     STORE_CONFIG.email,
    adminWhatsapp:  STORE_CONFIG.whatsapp,
    adminStoreName: STORE_CONFIG.name,
    // EmailJS
    adminEjsPublicKey:       EMAILJS_CONFIG.publicKey        !== "SUA_PUBLIC_KEY_AQUI"      ? EMAILJS_CONFIG.publicKey        : "",
    adminEjsServiceId:       EMAILJS_CONFIG.serviceId        !== "SEU_SERVICE_ID_AQUI"       ? EMAILJS_CONFIG.serviceId        : "",
    adminEjsTemplateCliente: EMAILJS_CONFIG.templateCliente  !== "SEU_TEMPLATE_CLIENTE_ID"   ? EMAILJS_CONFIG.templateCliente  : "",
    adminEjsTemplateLojista: EMAILJS_CONFIG.templateLojista  !== "SEU_TEMPLATE_LOJISTA_ID"   ? EMAILJS_CONFIG.templateLojista  : "",
  };
  Object.entries(fields).forEach(([id, val]) => {
    const el = document.getElementById(id);
    if (el) el.value = val || "";
  });
}

// ============================================================
//  ADMIN — SALVAR CONFIG
// ============================================================
function saveConfig() {
  const pix    = document.getElementById("adminPixKey")?.value.trim();
  const email  = document.getElementById("adminEmail")?.value.trim();
  const whats  = document.getElementById("adminWhatsapp")?.value.trim();
  const name   = document.getElementById("adminStoreName")?.value.trim();

  // EmailJS credentials
  const ejsPublicKey       = document.getElementById("adminEjsPublicKey")?.value.trim();
  const ejsServiceId       = document.getElementById("adminEjsServiceId")?.value.trim();
  const ejsTemplateCliente = document.getElementById("adminEjsTemplateCliente")?.value.trim();
  const ejsTemplateLojista = document.getElementById("adminEjsTemplateLojista")?.value.trim();

  if (!pix) { showToast("⚠️ Insira a chave PIX!"); return; }

  STORE_CONFIG.pixKey    = pix;
  STORE_CONFIG.email     = email || STORE_CONFIG.email;
  STORE_CONFIG.whatsapp  = whats || STORE_CONFIG.whatsapp;
  STORE_CONFIG.name      = name  || STORE_CONFIG.name;

  // Atualiza EmailJS em memória e no storage
  if (ejsPublicKey)       EMAILJS_CONFIG.publicKey        = ejsPublicKey;
  if (ejsServiceId)       EMAILJS_CONFIG.serviceId        = ejsServiceId;
  if (ejsTemplateCliente) EMAILJS_CONFIG.templateCliente  = ejsTemplateCliente;
  if (ejsTemplateLojista) EMAILJS_CONFIG.templateLojista  = ejsTemplateLojista;

  saveToStorage();
  applyConfigToUI();
  showToast("✅ Configurações salvas!");
}

// ============================================================
//  ADMIN — TESTAR EMAILJS
//  Envia um e-mail de teste para o e-mail de suporte da loja
//  para confirmar que as credenciais estão corretas.
// ============================================================
async function testEmailJS() {
  const btn = document.querySelector(".admin-test-btn");
  const status = document.getElementById("ejsStatus");

  // Salva antes de testar para garantir que usa os valores dos campos
  saveConfig();

  if (!EMAILJS_CONFIG.publicKey || EMAILJS_CONFIG.publicKey === "SUA_PUBLIC_KEY_AQUI") {
    if (status) { status.textContent = "❌ Public Key não configurada."; status.className = "emailjs-status err"; }
    showToast("⚠️ Preencha a Public Key do EmailJS!"); return;
  }
  if (!EMAILJS_CONFIG.serviceId || EMAILJS_CONFIG.serviceId === "SEU_SERVICE_ID_AQUI") {
    if (status) { status.textContent = "❌ Service ID não configurado."; status.className = "emailjs-status err"; }
    showToast("⚠️ Preencha o Service ID!"); return;
  }
  if (!EMAILJS_CONFIG.templateCliente || EMAILJS_CONFIG.templateCliente === "SEU_TEMPLATE_CLIENTE_ID") {
    if (status) { status.textContent = "❌ Template do cliente não configurado."; status.className = "emailjs-status err"; }
    showToast("⚠️ Preencha o Template ID do cliente!"); return;
  }

  if (btn) { btn.disabled = true; btn.textContent = "⏳ Enviando..."; }
  if (status) { status.textContent = "⏳ Conectando ao EmailJS..."; status.className = "emailjs-status loading"; }

  try {
    emailjs.init(EMAILJS_CONFIG.publicKey);

    await emailjs.send(EMAILJS_CONFIG.serviceId, EMAILJS_CONFIG.templateCliente, {
      to_name:          "Lojista (Teste)",
      to_email:         STORE_CONFIG.email,
      order_id:         "TESTE-001",
      order_total:      "R$ 99,90",
      order_items:      "• Produto de Teste (x1) — R$ 99,90",
      order_items_html: `<tr><td style="padding:6px 8px">Produto de Teste</td><td style="padding:6px 8px;text-align:center">1</td><td style="padding:6px 8px;text-align:right;font-weight:600">R$ 99,90</td></tr>`,
      order_date:       new Date().toLocaleString("pt-BR"),
      pix_key:          STORE_CONFIG.pixKey,
      store_name:       STORE_CONFIG.name,
      store_email:      STORE_CONFIG.email,
      store_whatsapp:   STORE_CONFIG.whatsapp,
      lojista_email:    STORE_CONFIG.email,
    });

    if (status) {
      status.textContent = `✅ Sucesso! E-mail de teste enviado para ${STORE_CONFIG.email}`;
      status.className = "emailjs-status ok";
    }
    showToast("✅ EmailJS funcionando! Verifique sua caixa de entrada.");
  } catch(err) {
    console.error("Erro no teste do EmailJS:", err);
    const msg = err.text || err.message || JSON.stringify(err);
    if (status) {
      status.textContent = `❌ Erro: ${msg}`;
      status.className = "emailjs-status err";
    }
    showToast("❌ Falha no teste. Verifique as credenciais.");
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = "🧪 Testar E-mail"; }
  }
}

// ============================================================
//  ADMIN — ADICIONAR PRODUTO
// ============================================================
function addProduct() {
  const name      = document.getElementById("newProdName")?.value.trim();
  const price     = parseFloat(document.getElementById("newProdPrice")?.value);
  const img       = document.getElementById("newProdImg")?.value.trim();
  const desc      = document.getElementById("newProdDesc")?.value.trim();
  const origPrice = parseFloat(document.getElementById("newProdOrigPrice")?.value) || null;

  if (!name) { showToast("⚠️ Nome do produto obrigatório!"); return; }
  if (!price || price <= 0) { showToast("⚠️ Preço inválido!"); return; }
  if (!img)  { showToast("⚠️ URL da imagem obrigatória!"); return; }

  // Gera novo ID único
  const newId = PRODUCTS.length > 0 ? Math.max(...PRODUCTS.map(p => p.id)) + 1 : 1;

  PRODUCTS.push({
    id: newId,
    name,
    price,
    img,
    desc: desc || "",
    origPrice: origPrice && origPrice > price ? origPrice : null
  });

  // Limpa campos
  ["newProdName","newProdPrice","newProdImg","newProdDesc","newProdOrigPrice"]
    .forEach(id => { const el = document.getElementById(id); if(el) el.value = ""; });

  saveToStorage();
  renderAdminList();
  renderProducts(PRODUCTS);
  showToast(`✅ Produto "${name}" adicionado!`);
  document.getElementById("adminProdCount").textContent = PRODUCTS.length;
}

// ============================================================
//  ADMIN — LISTA DE PRODUTOS
// ============================================================
function renderAdminList() {
  const el = document.getElementById("adminProductList");
  const countEl = document.getElementById("adminProdCount");
  if (!el) return;

  const q = document.getElementById("adminSearch")?.value.toLowerCase().trim() || "";
  const list = q ? PRODUCTS.filter(p => p.name.toLowerCase().includes(q)) : PRODUCTS;

  if (countEl) countEl.textContent = PRODUCTS.length;

  if (list.length === 0) {
    el.innerHTML = `<p style="color:var(--text2);font-size:0.85rem;padding:1rem 0">
      ${q ? "Nenhum produto encontrado." : "Nenhum produto cadastrado."}
    </p>`;
    return;
  }

  el.innerHTML = list.map(p => `
    <div class="admin-product-item">
      <img src="${p.img}" alt="${escapeHtml(p.name)}"
           onerror="this.src='https://placehold.co/50x50/1a1a24/e8ff47?text=?'" />
      <div class="admin-product-item-info">
        <strong>${escapeHtml(p.name)}</strong>
        <span>${formatPrice(p.price)}</span>
      </div>
      <div class="admin-item-btns">
        <button class="admin-edit-btn" onclick="openEditModal(${p.id})">✏️ Editar</button>
        <button class="admin-del-btn" onclick="deleteProduct(${p.id})">🗑 Excluir</button>
      </div>
    </div>
  `).join("");
}

// ============================================================
//  ADMIN — EDITAR PRODUTO
// ============================================================
function openEditModal(productId) {
  const p = PRODUCTS.find(x => x.id === productId);
  if (!p) return;
  document.getElementById("editProdId").value = p.id;
  document.getElementById("editProdName").value = p.name;
  document.getElementById("editProdPrice").value = p.price;
  document.getElementById("editProdImg").value = p.img;
  document.getElementById("editProdDesc").value = p.desc || "";
  document.getElementById("editProdOrigPrice").value = p.origPrice || "";

  document.getElementById("editModalOverlay").classList.add("open");
  document.getElementById("editModal").classList.add("open");
}

function closeEditModal() {
  document.getElementById("editModalOverlay").classList.remove("open");
  document.getElementById("editModal").classList.remove("open");
}

function saveEditProduct() {
  const id        = parseInt(document.getElementById("editProdId")?.value);
  const name      = document.getElementById("editProdName")?.value.trim();
  const price     = parseFloat(document.getElementById("editProdPrice")?.value);
  const img       = document.getElementById("editProdImg")?.value.trim();
  const desc      = document.getElementById("editProdDesc")?.value.trim();
  const origPrice = parseFloat(document.getElementById("editProdOrigPrice")?.value) || null;

  if (!name || !price || !img) { showToast("⚠️ Preencha todos os campos obrigatórios!"); return; }

  const idx = PRODUCTS.findIndex(x => x.id === id);
  if (idx === -1) return;

  PRODUCTS[idx] = { id, name, price, img, desc, origPrice: origPrice && origPrice > price ? origPrice : null };

  saveToStorage();
  renderAdminList();
  renderProducts(PRODUCTS);
  closeEditModal();
  showToast("✅ Produto atualizado!");
}

// ============================================================
//  ADMIN — EXCLUIR PRODUTO
// ============================================================
function deleteProduct(productId) {
  const p = PRODUCTS.find(x => x.id === productId);
  if (!p) return;
  if (!confirm(`Excluir "${p.name}"?`)) return;
  PRODUCTS = PRODUCTS.filter(x => x.id !== productId);
  saveToStorage();
  renderAdminList();
  renderProducts(PRODUCTS);
  showToast("🗑 Produto removido!");
}

// ============================================================
//  MOBILE MENU
// ============================================================
function toggleMobileMenu() {
  document.getElementById("mobileMenu").classList.toggle("open");
}

// ============================================================
//  TOAST NOTIFICATION
// ============================================================
let toastTimeout;
function showToast(msg) {
  const el = document.getElementById("toast");
  if (!el) return;
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => el.classList.remove("show"), 3000);
}

// ============================================================
//  MÁSCARAS
// ============================================================
function maskCPF(input) {
  let v = input.value.replace(/\D/g, "").substring(0, 11);
  if (v.length > 9) v = v.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, "$1.$2.$3-$4");
  else if (v.length > 6) v = v.replace(/(\d{3})(\d{3})(\d{0,3})/, "$1.$2.$3");
  else if (v.length > 3) v = v.replace(/(\d{3})(\d{0,3})/, "$1.$2");
  input.value = v;
}

function maskCEP(input) {
  let v = input.value.replace(/\D/g, "").substring(0, 8);
  if (v.length > 5) v = v.replace(/(\d{5})(\d{0,3})/, "$1-$2");
  input.value = v;
}

// ============================================================
//  VALIDAÇÕES
// ============================================================
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateCPF(cpf) {
  // Aceita formato 000.000.000-00 ou apenas números
  const raw = cpf.replace(/\D/g, "");
  if (raw.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(raw)) return false; // todos iguais

  // Dígitos verificadores
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(raw[i]) * (10 - i);
  let r = 11 - (sum % 11);
  if (r >= 10) r = 0;
  if (r !== parseInt(raw[9])) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(raw[i]) * (11 - i);
  r = 11 - (sum % 11);
  if (r >= 10) r = 0;
  return r === parseInt(raw[10]);
}

// ============================================================
//  UTILITÁRIOS
// ============================================================
function formatPrice(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency", currency: "BRL"
  }).format(value);
}

function generateOrderId() {
  return "SD" + Date.now().toString(36).toUpperCase().slice(-6);
}

function escapeHtml(str) {
  if (!str) return "";
  return str.replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
}
