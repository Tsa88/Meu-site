const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

function createClassList() {
  const classes = new Set();
  return {
    add(...tokens) {
      tokens.forEach((t) => classes.add(t));
    },
    remove(...tokens) {
      tokens.forEach((t) => classes.delete(t));
    },
    contains(token) {
      return classes.has(token);
    },
    toggle(token, force) {
      if (typeof force === "boolean") {
        if (force) classes.add(token);
        else classes.delete(token);
        return force;
      }
      if (classes.has(token)) {
        classes.delete(token);
        return false;
      }
      classes.add(token);
      return true;
    },
    toString() {
      return [...classes].join(" ");
    },
  };
}

function createElement(id = "") {
  return {
    id,
    value: "",
    textContent: "",
    innerHTML: "",
    disabled: false,
    style: { display: "", overflow: "", boxShadow: "" },
    classList: createClassList(),
    select() {},
    appendChild() {},
    removeChild() {},
  };
}

function createStorage() {
  const store = new Map();
  return {
    getItem(key) {
      return store.has(key) ? store.get(key) : null;
    },
    setItem(key, value) {
      store.set(key, String(value));
    },
    removeItem(key) {
      store.delete(key);
    },
    clear() {
      store.clear();
    },
  };
}

function loadAppContext() {
  const elements = new Map();
  const getOrCreateElement = (id) => {
    if (!elements.has(id)) elements.set(id, createElement(id));
    return elements.get(id);
  };

  const document = {
    addEventListener() {},
    getElementById(id) {
      return elements.has(id) ? elements.get(id) : null;
    },
    querySelector(selector) {
      if (selector === ".confirm-btn") return getOrCreateElement("confirm-btn");
      if (selector === ".admin-test-btn") return getOrCreateElement("admin-test-btn");
      return null;
    },
    createElement() {
      return createElement();
    },
    execCommand() {
      return true;
    },
    body: {
      style: { overflow: "" },
      appendChild() {},
      removeChild() {},
    },
  };

  const localStorage = createStorage();
  const navigator = {
    clipboard: {
      writeText: () => Promise.resolve(),
    },
  };
  const window = {
    location: { search: "" },
    addEventListener() {},
    scrollTo() {},
    scrollY: 0,
  };
  const confirm = () => true;

  const context = vm.createContext({
    console,
    document,
    localStorage,
    navigator,
    window,
    confirm,
    Date,
    Math,
    Intl,
    JSON,
    parseInt,
    parseFloat,
    setTimeout,
    clearTimeout,
  });

  const appPath = path.resolve(__dirname, "..", "..", "app.js");
  const source = fs.readFileSync(appPath, "utf8");
  vm.runInContext(source, context, { filename: appPath });

  return {
    context,
    createDomElements(ids) {
      ids.forEach((id) => getOrCreateElement(id));
    },
    element(id) {
      return getOrCreateElement(id);
    },
  };
}

module.exports = { loadAppContext };
