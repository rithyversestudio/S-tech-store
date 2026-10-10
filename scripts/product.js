// Product detail page: reads ?id=... and renders that product's details.json.
const root = document.getElementById("product");

function showNotFound() {
  document.title = `Product not found | ${SHOP.name}`;
  root.innerHTML = `
    <div class="not-found">
      <h1>Product not found</h1>
      <p>The product link may be wrong, or the product is no longer available.</p>
      <a class="btn" href="index.html#catalog">Browse all products</a>
    </div>`;
}

const specList = (obj) => `<dl class="specs">${Object.entries(obj)
  .map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join("")}</dl>`;

function availabilityClass(text = "") {
  const t = text.toLowerCase();
  if (t.includes("out")) return "bad";
  if (t.includes("in stock")) return "ok";
  return "warn";
}

function render(p) {
  document.title = `${p.name} | ${SHOP.name}`;
  document.getElementById("site-header").querySelectorAll("a").forEach((a) => {
    if (a.href.includes(`category=${p.category}`)) a.setAttribute("aria-current", "page");
  });

  const images = p.images.length ? p.images : [PLACEHOLDER];
  const paragraphs = String(p.description || "").split("\n").filter(Boolean).map((t) => `<p>${esc(t)}</p>`).join("");
  const extra = p.additional && Object.keys(p.additional).length
    ? `<section><h2>Additional specifications</h2>${specList(p.additional)}</section>` : "";
  const specs = p.specs && Object.keys(p.specs).length
    ? `<section><h2>Specifications</h2>${specList(p.specs)}</section>` : "";

  root.innerHTML = `
    <div class="product-top">
      <div>
        <img id="main-image" class="gallery-main" src="${esc(images[0])}" alt="${esc(p.name)}">
        ${images.length > 1 ? `<div class="thumbs">${images.map((src, i) => `
          <button class="thumb" type="button" data-src="${esc(src)}" aria-label="Show image ${i + 1}" aria-current="${i === 0}">
            <img src="${esc(src)}" alt="">
          </button>`).join("")}</div>` : ""}
      </div>
      <div class="product-info">
        <span class="card-category">${esc(CATEGORIES[p.category] || p.category)}</span>
        <h1>${esc(p.name)}</h1>
        <span class="price">${formatPrice(p.price)}</span>
        <span class="badge ${availabilityClass(p.availability)}">${esc(p.availability || "Contact us")}</span>
        <div class="description">${paragraphs}</div>
        <p><a class="btn btn-outline" href="#contact">Contact us about this product</a></p>
      </div>
    </div>
    <div class="spec-grid">${specs}${extra}</div>`;

  const main = document.getElementById("main-image");
  root.querySelectorAll(".thumb").forEach((btn) => {
    btn.addEventListener("click", () => {
      main.src = btn.dataset.src;
      root.querySelectorAll(".thumb").forEach((b) => b.setAttribute("aria-current", String(b === btn)));
    });
  });
  applyImageFallback(root);
}

async function init() {
  const id = new URLSearchParams(location.search).get("id");
  if (!id || !/^[\w-]+$/.test(id)) return showNotFound();
  try {
    render(await loadProduct(id));
  } catch (err) {
    console.error(err);
    showNotFound();
  }
}

init();
