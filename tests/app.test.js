const test = require("node:test");
const assert = require("node:assert/strict");
const { loadAppContext } = require("./helpers/load-app-context");

function createUiContext() {
  const app = loadAppContext();
  app.createDomElements([
    "productsGrid",
    "noResults",
    "searchInput",
    "cartBadge",
    "cartItems",
    "cartFooter",
    "cartTotal",
    "toast",
  ]);
  return app;
}

test("validateEmail aceita e rejeita formatos esperados", () => {
  const { context } = loadAppContext();
  assert.equal(context.validateEmail("cliente@exemplo.com"), true);
  assert.equal(context.validateEmail("cliente+tag@exemplo.com.br"), true);
  assert.equal(context.validateEmail("invalido"), false);
  assert.equal(context.validateEmail("invalido@"), false);
  assert.equal(context.validateEmail("invalido@dominio"), false);
});

test("validateCPF valida CPF correto e rejeita inválidos", () => {
  const { context } = loadAppContext();
  assert.equal(context.validateCPF("529.982.247-25"), true);
  assert.equal(context.validateCPF("52998224725"), true);
  assert.equal(context.validateCPF("111.111.111-11"), false);
  assert.equal(context.validateCPF("123.456.789-00"), false);
  assert.equal(context.validateCPF("123"), false);
});

test("maskCPF formata entrada corretamente", () => {
  const { context } = loadAppContext();
  const input = { value: "52998224725" };
  context.maskCPF(input);
  assert.equal(input.value, "529.982.247-25");
});

test("maskCEP formata entrada corretamente", () => {
  const { context } = loadAppContext();
  const input = { value: "12345678" };
  context.maskCEP(input);
  assert.equal(input.value, "12345-678");
});

test("escapeHtml escapa caracteres perigosos", () => {
  const { context } = loadAppContext();
  assert.equal(
    context.escapeHtml(`<img src="x" onerror="alert('x')">&`),
    "&lt;img src=&quot;x&quot; onerror=&quot;alert('x')&quot;&gt;&amp;"
  );
  assert.equal(context.escapeHtml(""), "");
});

test("formatPrice retorna valor monetário em pt-BR", () => {
  const { context } = loadAppContext();
  assert.equal(context.formatPrice(1234.56), "R$\u00A01.234,56");
});

test("generateOrderId cria ID com prefixo SD e 8 caracteres", () => {
  const { context } = loadAppContext();
  const id = context.generateOrderId();
  assert.match(id, /^SD[A-Z0-9]{6}$/);
});

test("filterProducts renderiza resultados encontrados", () => {
  const app = createUiContext();
  const { context, element } = app;
  element("searchInput").value = "smartwatch";

  context.filterProducts();

  assert.match(element("productsGrid").innerHTML, /Smartwatch Sport Pro/);
  assert.equal(element("noResults").style.display, "none");
});

test("filterProducts mostra estado vazio quando não encontra produtos", () => {
  const app = createUiContext();
  const { context, element } = app;
  element("searchInput").value = "produto-inexistente";

  context.filterProducts();

  assert.equal(element("productsGrid").innerHTML, "");
  assert.equal(element("noResults").style.display, "block");
});

test("addToCart acumula quantidade e atualiza badge", () => {
  const app = createUiContext();
  const { context, element } = app;

  context.addToCart(1);
  context.addToCart(1, 2);

  const cart = JSON.parse(context.localStorage.getItem("shopDrop_cart"));
  assert.equal(cart.length, 1);
  assert.equal(cart[0].qty, 3);
  assert.equal(element("cartBadge").textContent, 3);
  assert.match(element("cartItems").innerHTML, /Fone de Ouvido Bluetooth Premium/);
});

test("changeCartQty respeita mínimo de 1 unidade", () => {
  const app = createUiContext();
  const { context } = app;

  context.addToCart(1, 2);
  context.changeCartQty(1, -10);

  const cart = JSON.parse(context.localStorage.getItem("shopDrop_cart"));
  assert.equal(cart[0].qty, 1);
});

test("removeFromCart remove item específico", () => {
  const app = createUiContext();
  const { context } = app;

  context.addToCart(1);
  context.addToCart(2);
  context.removeFromCart(1);

  const cart = JSON.parse(context.localStorage.getItem("shopDrop_cart"));
  assert.equal(cart.length, 1);
  assert.equal(cart[0].id, 2);
});

test("clearCart limpa carrinho e esconde rodapé", () => {
  const app = createUiContext();
  const { context, element } = app;

  context.addToCart(1);
  context.clearCart();

  const cart = JSON.parse(context.localStorage.getItem("shopDrop_cart"));
  assert.deepEqual(cart, []);
  assert.equal(element("cartBadge").textContent, 0);
  assert.equal(element("cartFooter").style.display, "none");
});
