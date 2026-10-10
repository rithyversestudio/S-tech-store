// Catalog page: loads products, then handles search, category filter and sorting.
const els = {
  grid: document.getElementById("grid"),
  status: document.getElementById("status"),
  search: document.getElementById("site-search"),
  catSearch: document.getElementById("cat-search"),
  category: document.getElementById("category"),
  sort: document.getElementById("sort")
};
let products = [];
let activeCategory = ""; // set on a category page; the in-category search is limited to it

const sorters = {
  "name-asc": (a, b) => a.name.localeCompare(b.name),
  "name-desc": (a, b) => b.name.localeCompare(a.name),
  "price-asc": (a, b) => a.price - b.price,
  "price-desc": (a, b) => b.price - a.price
};

function matches(p, query, category) {
  if (category !== "all" && p.category !== category) return false;
  if (!query) return true;
  const haystack = [p.name, p.summary, p.description, ...Object.values(p.specs || {})].join(" ").toLowerCase();
  return query.split(/\s+/).every((word) => haystack.includes(word));
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

function renderRecommended() {
  let list = products.filter((p) => p.recommended);
  if (!list.length) list = products.slice(0, 5);
  const section = document.getElementById("recommended");
  section.hidden = !list.length;
  document.getElementById("rec-row").innerHTML = list.map(cardHTML).join("");
  applyImageFallback(section);
}

function render() {
  // On a category page the grid is filtered by the in-category box only (the header search is site-wide).
  const typed = activeCategory ? els.catSearch.value : els.search.value;
  const query = typed.trim().toLowerCase();
  const list = products.filter((p) => matches(p, query, activeCategory || els.category.value)).sort(sorters[els.sort.value]);
  els.grid.innerHTML = list.map(cardHTML).join("");
  applyImageFallback(els.grid);
  document.body.classList.toggle("searching", !!query && !activeCategory);
  document.getElementById("products-title").textContent = query && !activeCategory ? `Results for \u201c${typed.trim()}\u201d` : "Products";
  els.status.className = "status";
  els.status.textContent = list.length
    ? `Showing ${list.length} of ${activeCategory ? products.filter((p) => p.category === activeCategory).length : products.length} products`
    : "No products match your search. Try a different keyword or category.";
}

function buildCategoryUI() {
  els.category.innerHTML = `<option value="all">All products</option>` +
    Object.entries(CATEGORIES).map(([k, v]) => `<option value="${esc(k)}">${esc(v)}</option>`).join("");
  const row = document.getElementById("tile-row");
  row.innerHTML = Object.entries(CATEGORIES).map(([k, v]) => `
    <a class="tile" href="index.html?category=${esc(k)}">
      <img src="images/categories/${esc(k)}.png?v=${IMG_VER}" onerror="this.onerror=null;this.src=PLACEHOLDER" alt="" loading="lazy">
      <span>${esc(v)}</span>
    </a>`).join("");
}

async function init() {
  buildCategoryUI();
  try {
    products = await loadAllProducts();
  } catch (err) {
    console.error(err);
    els.status.className = "status error";
    els.status.textContent = "Products could not be loaded. If you opened this file directly, run a local server instead (see README).";
    return;
  }
  const params = new URLSearchParams(location.search);
  const requested = params.get("category");
  if (requested && CATEGORIES[requested]) {
    els.category.value = requested;
    activeCategory = requested;
    els.catSearch.placeholder = `Search in ${CATEGORIES[requested]}...`;
    document.getElementById("cat-search-field").hidden = false;
    document.body.classList.add("category-view");
    document.title = `${CATEGORIES[requested]} | ${SHOP.name}`;
    document.getElementById("category-title").textContent = CATEGORIES[requested];
    document.getElementById("category-bar").hidden = false;
    window.scrollTo(0, 0);
  }
  renderRecommended();
  document.getElementById("search-form").addEventListener("submit", (e) => {
    if (activeCategory) return; // header search on a category page goes to a site-wide search on the home page
    e.preventDefault();
    const q = els.search.value.trim();
    history.replaceState(null, "", q ? `index.html?q=${encodeURIComponent(q)}` : "index.html");
    render();
    document.getElementById("catalog").scrollIntoView();
  });
  ["input", "change"].forEach((evt) => {
    els.search.addEventListener(evt, render);
    els.catSearch.addEventListener(evt, render);
    els.category.addEventListener(evt, render);
    els.sort.addEventListener(evt, render);
  });
  render();
}

init();
