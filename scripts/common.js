// Shared helpers and site-wide settings. Edit SHOP to change the header/footer on every page.
const SHOP = {
  name: "S TECH STORE",
  email: "hello@stechstore.example",
  phone: "+1 555 010 0199",
  address: "12 Circuit Lane, Austin, TX 78701",
  hours: "Mon to Sat, 9:00 to 18:00",
  social: [
    { label: "Instagram", url: "https://www.instagram.com/" },
    { label: "Facebook", url: "https://www.facebook.com/" },
    { label: "YouTube", url: "https://www.youtube.com/" }
  ]
};

const CATEGORIES = { "pc-builds": "PC Builds", "accessories": "Accessories" };

const PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 4 3'%3E%3Crect width='4' height='3' fill='%23eceef1'/%3E%3C/svg%3E";

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const formatPrice = (n) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} returned ${res.status}`);
  return res.json();
}

// products/index.json only lists product folder names; everything else lives in each details.json.
async function loadProduct(id) {
  const p = await fetchJSON(`products/${encodeURIComponent(id)}/details.json`);
  p.id = id;
  p.images = (p.images || []).map((file) => `products/${encodeURIComponent(id)}/${encodeURIComponent(file)}`);
  return p;
}

async function loadAllProducts() {
  const { products } = await fetchJSON("products/index.json");
  const results = await Promise.allSettled(products.map(loadProduct));
  results.forEach((r, i) => { if (r.status === "rejected") console.warn(`Skipped "${products[i]}":`, r.reason); });
  return results.filter((r) => r.status === "fulfilled").map((r) => r.value);
}

// Swap broken images for a neutral placeholder.
function applyImageFallback(root) {
  root.querySelectorAll("img").forEach((img) => {
    img.addEventListener("error", () => { img.src = PLACEHOLDER; }, { once: true });
  });
}

function renderChrome() {
  const header = document.getElementById("site-header");
  const footer = document.getElementById("site-footer");
  const active = header.dataset.active;
  const link = (href, label, key) => `<li><a href="${href}"${key === active ? ' aria-current="page"' : ""}>${label}</a></li>`;

  const searchIcon = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>`;
  header.innerHTML = `
    <div class="container nav">
      <a class="logo" href="index.html"><img class="logo-mark" src="images/logo.png" alt="" width="36" height="36">${esc(SHOP.name)}</a>
      <form class="search" id="search-form" role="search" action="index.html" method="get">
        <span class="search-icon">${searchIcon}</span>
        <input id="site-search" name="q" type="search" placeholder="Search for PCs, monitors, keyboards or more..." aria-label="Search products" autocomplete="off" aria-controls="search-suggest" aria-expanded="false">
        <button type="submit" aria-label="Search">${searchIcon}</button>
        <ul id="search-suggest" class="suggest" role="listbox" hidden></ul>
      </form>
    </div>
    <div class="nav-row"><nav class="container" aria-label="Main"><ul>
      ${link("index.html", "Home", "home")}
      ${link("index.html?category=pc-builds#catalog", "PC Builds", "pc-builds")}
      ${link("index.html?category=accessories#catalog", "Accessories", "accessories")}
      ${link("#contact", "Contact", "contact")}
    </ul></nav></div>`;

  footer.id = "contact";
  footer.innerHTML = `
    <div class="container">
      <div class="footer-grid">
        <div><h3>${esc(SHOP.name)}</h3><p>Custom-built PCs and accessories, assembled and tested in-house.</p></div>
        <div><h3>Contact</h3><ul>
          <li><a href="mailto:${esc(SHOP.email)}">${esc(SHOP.email)}</a></li>
          <li><a href="tel:${esc(SHOP.phone.replace(/\s/g, ""))}">${esc(SHOP.phone)}</a></li>
          <li>${esc(SHOP.address)}</li>
          <li>${esc(SHOP.hours)}</li>
        </ul></div>
        <div><h3>Follow us</h3><ul>
          ${SHOP.social.map((s) => `<li><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.label)}</a></li>`).join("")}
        </ul></div>
      </div>
      <p class="copyright">&copy; ${new Date().getFullYear()} ${esc(SHOP.name)}. Prices and availability may change.</p>
    </div>`;
}

renderChrome();

// Pre-fill the header search from ?q= on every page.
(() => {
  const q = new URLSearchParams(location.search).get("q");
  if (q) document.getElementById("site-search").value = q;
})();

// Live suggestions under the header search (products load on first use).
(() => {
  const input = document.getElementById("site-search");
  const list = document.getElementById("search-suggest");
  const form = document.getElementById("search-form");
  let all = null, active = -1;

  const close = () => { list.hidden = true; input.setAttribute("aria-expanded", "false"); active = -1; };
  const setActive = (i) => {
    const items = [...list.children];
    items.forEach((li, n) => li.classList.toggle("active", n === i));
    active = i;
  };

  async function update() {
    const words = input.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
    if (!words.length) return close();
    if (!all) { try { all = await loadAllProducts(); } catch { return; } }
    const hits = all.filter((p) => {
      const hay = [p.name, p.summary, ...Object.values(p.specs || {})].join(" ").toLowerCase();
      return words.every((w) => hay.includes(w));
    }).slice(0, 5);
    list.innerHTML = hits.length
      ? hits.map((p) => `<li role="option"><a href="product.html?id=${encodeURIComponent(p.id)}"><img src="${esc(p.images[0] || PLACEHOLDER)}" alt=""><span class="s-name">${esc(p.name)}</span><span class="s-price">${formatPrice(p.price)}</span></a></li>`).join("")
      : `<li class="s-empty">No matches. Press Enter to search anyway.</li>`;
    applyImageFallback(list);
    list.hidden = false;
    input.setAttribute("aria-expanded", "true");
    active = -1;
  }

  input.addEventListener("input", update);
  input.addEventListener("focus", update);
  input.addEventListener("keydown", (e) => {
    const n = list.querySelectorAll("a").length;
    if (e.key === "Escape") close();
    else if (e.key === "ArrowDown" && n) { e.preventDefault(); setActive((active + 1) % n); }
    else if (e.key === "ArrowUp" && n) { e.preventDefault(); setActive((active - 1 + n) % n); }
    else if (e.key === "Enter" && active >= 0) { e.preventDefault(); list.querySelectorAll("a")[active].click(); }
  });
  form.addEventListener("submit", close);
  document.addEventListener("click", (e) => { if (!form.contains(e.target)) close(); });
})();
