(function () {
  "use strict";

  function el(tag, props, children) {
    var node = document.createElement(tag);
    Object.keys(props || {}).forEach(function (k) {
      if (k === "text") node.textContent = props[k];
      else node.setAttribute(k, props[k]);
    });
    (children || []).forEach(function (c) { node.appendChild(c); });
    return node;
  }

  // ---- Chain explorer ----
  var list = document.getElementById("chain-list");
  var panel = document.getElementById("chain-panel");

  function showJoint(i) {
    Array.prototype.forEach.call(list.children, function (li, idx) {
      li.firstChild.setAttribute("aria-pressed", idx === i ? "true" : "false");
    });
    panel.textContent = "";
    panel.appendChild(el("h3", { text: CHAIN[i].joint }));
    panel.appendChild(el("p", { text: CHAIN[i].text }));
  }
  CHAIN.forEach(function (c, i) {
    var b = el("button", { type: "button", "aria-pressed": "false", text: c.joint });
    b.addEventListener("click", function () { showJoint(i); });
    list.appendChild(el("li", {}, [b]));
  });
  showJoint(0);

  // ---- Directory feed ----
  var state = { query: "", category: "All" };
  var nav = document.getElementById("cat-nav");
  var feed = document.getElementById("feed");
  var count = document.getElementById("count");
  var empty = document.getElementById("empty");

  function syncNav() {
    Array.prototype.forEach.call(nav.children, function (li) {
      var b = li.firstChild;
      b.setAttribute("aria-current", b.getAttribute("data-cat") === state.category ? "true" : "false");
    });
  }
  ["All"].concat(CATEGORIES).forEach(function (cat) {
    var b = el("button", { type: "button", "data-cat": cat, text: cat });
    b.addEventListener("click", function () { state.category = cat; syncNav(); render(); });
    nav.appendChild(el("li", {}, [b]));
  });
  syncNav();

  document.getElementById("search").addEventListener("input", function (e) {
    state.query = e.target.value.trim().toLowerCase();
    render();
  });

  function matches(item) {
    if (state.category !== "All" && item.category !== state.category) return false;
    if (!state.query) return true;
    var hay = [item.name, item.description, item.feet, item.category, item.type, item.tags.join(" ")].join(" ").toLowerCase();
    return hay.indexOf(state.query) !== -1;
  }

  function entry(item) {
    var kind = item.type === "service" ? "Service" : "Product";
    return el("article", { "class": "entry" }, [
      el("p", { "class": "cat", text: item.category + " (" + kind.toLowerCase() + ")" }),
      el("h2", {}, [el("a", { href: item.url, rel: "noopener", text: item.name })]),
      el("p", { "class": "desc", text: "— " + item.description }),
      el("p", { "class": "feet", text: "Foot link: " + item.feet }),
      el("p", { "class": "meta" }, [el("a", { href: item.url, rel: "noopener", text: item.type === "service" ? "Visit service" : "View product" })])
    ]);
  }

  function render() {
    var out = LISTINGS.filter(matches);
    feed.textContent = "";
    out.forEach(function (item) { feed.appendChild(entry(item)); });
    count.textContent = out.length + (out.length === 1 ? " listing" : " listings");
    empty.hidden = out.length !== 0;
  }
  render();

  document.getElementById("year").textContent = new Date().getFullYear();
})();
