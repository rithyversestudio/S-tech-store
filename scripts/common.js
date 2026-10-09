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

  header.innerHTML = `
    <div class="container nav">
      <a class="logo" href="index.html"><img class="logo-mark" src="images/logo.png" alt="" width="32" height="32">${esc(SHOP.name)}</a>
      <nav aria-label="Main"><ul>
        ${link("index.html", "Home", "home")}
        ${link("index.html?category=pc-builds#catalog", "PC Builds", "pc-builds")}
        ${link("index.html?category=accessories#catalog", "Accessories", "accessories")}
        ${link("#contact", "Contact", "contact")}
      </ul></nav>
    </div>`;

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
