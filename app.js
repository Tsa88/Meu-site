/* =========================================================================
   SHOPDROP app.js - Lógica Completa e Integrada (VERSÃO ATUALIZADA)
   ========================================================================= */

// CONFIGURAÇÕES PADRÃO DO SISTEMA - ATUALIZADO COM SEUS DADOS
const STORE_CONFIG = {
    name: "ShopDrop",
    pixKey: "tsa.albuquerque@gmail.com", // Coloquei seu e-mail como chave PIX (mude se for outra)
    email: "tsa.albuquerque@gmail.com",
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
    if (!localStorage.getItem("config_reset_v1")) {
        localStorage.removeItem("shopDrop_config");
        localStorage.setItem("config_reset_v1", "true");
    }

    loadFromStorage();
    renderProducts(PRODUCTS);
    renderAdminList();
    
    // Atualiza os textos de contato no HTML com os dados do JS
    applyConfigToUI();

    if (window.location.search.includes("admin=1")) {
        showPage('adminPanel');
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
        whatsEl.textContent = "(75) 99210-1434";
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

    document.
