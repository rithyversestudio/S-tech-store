// Catalog page: loads products, then handles search, category filter and sorting.
const els = {
  grid: document.getElementById("grid"),
  status: document.getElementById("status"),
  search: document.getElementById("site-search"),
  category: document.getElementById("category"),
  sort: document.getElementById("sort")
};
let products = [];
let activeType = "";
const TYPES = { "gaming-pc": "Gaming PCs", "creator-pc": "Creator PCs", "office-pc": "Office PCs", "monitor": "Monitors", "keyboard": "Keyboards", "mouse": "Mice" };

const sorters = {
  "name-asc": (a, b) => a.name.localeCompare(b.name),
  "name-desc": (a, b) => b.name.localeCompare(a.name),
  "price-asc": (a, b) => a.price - b.price,
  "price-desc": (a, b) => b.price - a.price
};

function matches(p, query, category) {
  if (activeType && p.type !== activeType) return false;
  if (category !== "all" && p.category !== category) return false;
  if (!query) return true;
  const haystack = [p.name, p.summary, p.description, ...Object.values(p.specs || {})].join(" ").toLowerCase();
  return query.split(/\s+/).every((word) => haystack.includes(word));
}

function renderRecommended() {
  let list = products.filter((p) => p.recommended);
  if (!list.length) list = products.slice(0, 5);
  const section = document.getElementById("recommended");
  section.hidden = !list.length;
  const wished = getWishlist();
  const row = document.getElementById("rec-row");
  row.innerHTML = list.slice(0, 5).map((p) => `
    <article class="rec-card">
      <a class="rec-link" href="product.html?id=${encodeURIComponent(p.id)}">
        <div class="rec-img"><img src="${esc(p.images[0] || PLACEHOLDER)}" alt="" loading="lazy"></div>
        <h3>${esc(p.name)}</h3>
        <p class="rec-sub">${esc(p.summary || "")}</p>
        <span class="price">${formatPrice(p.price)}</span>
      </a>
      <button class="wish" type="button" data-id="${esc(p.id)}" aria-pressed="${wished.includes(p.id)}" aria-label="Save ${esc(p.name)} to wishlist">
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M12 20.5s-7.5-4.6-9.2-9.4C1.7 7.8 3.6 4.5 7 4.5c2 0 3.5 1.1 5 3 1.5-1.9 3-3 5-3 3.4 0 5.3 3.3 4.2 6.6-1.7 4.8-9.2 9.4-9.2 9.4z"/></svg>
      </button>
    </article>`).join("");
  row.onclick = (e) => {
    const btn = e.target.closest(".wish");
    if (!btn) return;
    const ids = getWishlist();
    const next = ids.includes(btn.dataset.id) ? ids.filter((i) => i !== btn.dataset.id) : [...ids, btn.dataset.id];
    try { localStorage.setItem("wishlist", JSON.stringify(next)); } catch {}
    btn.setAttribute("aria-pressed", String(next.includes(btn.dataset.id)));
  };
  applyImageFallback(section);
}

function getWishlist() {
  try { return JSON.parse(localStorage.getItem("wishlist")) || []; } catch { return []; }
}

function cardHTML(p) {
  const href = `product.html?id=${encodeURIComponent(p.id)}`;
  return `
    <article class="card">
      <a href="${href}" tabindex="-1" aria-hidden="true"><img src="${esc(p.images[0] || PLACEHOLDER)}" alt="" loading="lazy"></a>
      <div class="card-body">
        <span class="card-category">${esc(CATEGORIES[p.category] || p.category)}</span>
        <h3>${esc(p.name)}</h3>
        <p class="card-summary">${esc(p.summary || "")}</p>
        <div class="card-footer">
          <span class="price">${formatPrice(p.price)}</span>
          <a class="btn" href="${href}" aria-label="View details for ${esc(p.name)}">View Details</a>
        </div>
      </div>
    </article>`;
}

function render() {
  const query = els.search.value.trim().toLowerCase();
  const list = products.filter((p) => matches(p, query, els.category.value)).sort(sorters[els.sort.value]);
  els.grid.innerHTML = list.map(cardHTML).join("");
  applyImageFallback(els.grid);
  document.body.classList.toggle("searching", !!query);
  document.getElementById("products-title").textContent = query ? `Results for \u201c${els.search.value.trim()}\u201d` : "Products";
  els.status.className = "status";
  els.status.textContent = list.length
    ? `Showing ${list.length} of ${products.length} products`
    : "No products match your search. Try a different keyword or category.";
}

async function init() {
  try {
    products = await loadAllProducts();
  } catch (err) {
    console.error(err);
    els.status.className = "status error";
    els.status.textContent = "Products could not be loaded. If you opened this file directly, run a local server instead (see README).";
    return;
  }
  const params = new URLSearchParams(location.search);
  const type = params.get("type");
  if (type && TYPES[type]) {
    activeType = type;
    document.body.classList.add("category-view");
    document.title = `${TYPES[type]} | ${SHOP.name}`;
    document.getElementById("category-title").textContent = TYPES[type];
    document.getElementById("category-bar").hidden = false;
    window.scrollTo(0, 0);
  }
  const requested = params.get("category");
  if (requested && CATEGORIES[requested]) els.category.value = requested;
  renderRecommended();
  document.getElementById("search-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const q = els.search.value.trim();
    history.replaceState(null, "", q ? `index.html?q=${encodeURIComponent(q)}` : "index.html");
    render();
    document.getElementById("catalog").scrollIntoView();
  });
  ["input", "change"].forEach((evt) => {
    els.search.addEventListener(evt, render);
    els.category.addEventListener(evt, render);
    els.sort.addEventListener(evt, render);
  });
  render();
}

init();
