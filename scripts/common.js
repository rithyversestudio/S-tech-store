// Shared helpers and site-wide settings. Edit SHOP to change the header/footer on every page.
const SHOP = {
  name: "S TECH STORE",
  email: "stectstore3@gmail.com",
  phone: "093 393 345",
  telegram: "https://t.me/PCANDGAMESTORE",
  address: "12 Circuit Lane, Austin, TX 78701",
  hours: "Mon to Sat, 9:00 to 18:00",
  mapLink: "https://maps.app.goo.gl/r9RHLS3vN4okqGZg8", // opens when the map card is tapped
  mapUrl: "https://maps.app.goo.gl/r9RHLS3vN4okqGZg8",
  mapEmbed: "https://maps.google.com/maps?q=11.5428274,104.8345808&z=17&output=embed",
  social: [
    { label: "Facebook", url: "https://www.facebook.com/sellcomputer" },
    { label: "Telegram", url: "https://t.me/COMPUTERSTOREBUY" }
  ]
};

// Single source of truth for categories: slug -> label (order = display order).
// Each product's "category" in details.json must be one of these slugs.
const CATEGORIES = {
  "pc-builds": "PC Builds",
  "monitors": "Monitors",
  "graphics-cards": "Graphics Cards",
  "processors": "Processors",
  "motherboards": "Motherboards",
  "ram": "RAM",
  "storage-ssd-hdd": "Storage (SSD/HDD)",
  "power-supplies": "Power Supplies",
  "pc-cases": "PC Cases",
  "cooling-systems": "Cooling Systems",
  "keyboards": "Keyboards",
  "mice": "Mice",
  "headsets": "Headsets",
  "gaming-chair": "Gaming Chair",
  "other-accessories": "Other Accessories"
};

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
      ${link("index.html#categories", "All Categories", "categories")}
      ${link("#contact", "Contact", "contact")}
    </ul></nav></div>`;

  footer.id = "contact";
  const icons = {
    Telegram: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21.4 4.2 2.9 11.3c-1.1.4-1.1 1.1-.2 1.4l4.7 1.5 1.8 5.5c.2.6.4.8.8.8.4 0 .6-.2.9-.4l2.3-2.2 4.7 3.5c.9.5 1.5.2 1.7-.8l3.1-14.6c.3-1.3-.5-1.9-1.3-1.6zM8.5 13.7l9.7-6.1c.5-.3.9-.1.5.2l-8 7.2-.3 3.3-1.9-4.6z"/></svg>',
    Instagram: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>',
    Facebook: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13.5 21v-7.5H16l.5-3h-3V8.6c0-.9.3-1.5 1.6-1.5h1.5V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.8 1.4-3.8 3.9v2.3H8v3h2.5V21h3z"/></svg>',
    YouTube: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2C2 8.8 2 12 2 12s0 3.2.4 4.8a2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8c.4-1.6.4-4.8.4-4.8s0-3.2-.4-4.8zM10 15V9l5.2 3L10 15z"/></svg>'
  };
  // Footer shows only a few popular categories (edit this list); the rest are under "All Categories".
  const footerCategories = ["pc-builds", "monitors", "graphics-cards", "keyboards", "mice"];
  const shopLinks = footerCategories.filter((k) => CATEGORIES[k]).map((k) => [k, CATEGORIES[k]]);
  footer.innerHTML = `
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand">
          <a class="logo" href="index.html"><img class="logo-mark" src="images/logo.png" alt="" width="36" height="36">${esc(SHOP.name)}</a>
          <p class="footer-tag">Custom-built PCs and accessories</p>
        </div>
        <div><h3>Shop</h3><ul>
          ${shopLinks.map(([t, l]) => `<li><a href="index.html?category=${t}">${l}</a></li>`).join("")}
          <li><a href="index.html#categories">All Categories</a></li>
        </ul></div>
        <div><h3>Contact</h3><ul>
          <li><a href="mailto:${esc(SHOP.email)}">${esc(SHOP.email)}</a></li>
          <li><a href="${esc(SHOP.telegram)}" target="_blank" rel="noopener">Telegram: @${esc(SHOP.telegram.split("/").pop())}</a></li>
          <li><a href="tel:${esc(SHOP.phone.replace(/\s/g, ""))}">${esc(SHOP.phone)}</a></li>
        </ul></div>
        <div><h3>Follow Us</h3>
          <ul class="social">
            ${SHOP.social.map((s) => `<li><a href="${esc(s.url)}" target="_blank" rel="noopener" aria-label="${esc(s.label)}" title="${esc(s.label)}">${icons[s.label] || esc(s.label)}</a></li>`).join("")}
          </ul>
        </div>
        <div><h3>Location</h3>
          <a class="map-card" href="${esc(SHOP.mapLink)}" target="_blank" rel="noopener" aria-label="Open ${esc(SHOP.name)} location in Google Maps">
            <iframe src="${esc(SHOP.mapEmbed)}" title="Map preview" loading="lazy" tabindex="-1" referrerpolicy="no-referrer-when-downgrade"></iframe>
          </a>
        </div>
      </div>
      <div class="footer-bottom">
        <p class="copyright">&copy; ${new Date().getFullYear()} ${esc(SHOP.name)}. All rights reserved. Prices and availability may change.</p>
        <p class="footer-slogan">Better Technology &middot; <strong>A Brighter Tomorrow.</strong></p>
      </div>
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
