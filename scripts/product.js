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

// A product shows up to this many images (the first one is also the card thumbnail).
const MAX_IMAGES = 4;

function render(p) {
  document.title = `${p.name} | ${SHOP.name}`;
  setActiveNav(p.category);

  const images = p.images.length ? p.images.slice(0, MAX_IMAGES) : [PLACEHOLDER];
  const paragraphs = String(p.description || "").split("\n").filter(Boolean).map((t) => `<p>${esc(t)}</p>`).join("");
  const extra = p.additional && Object.keys(p.additional).length
    ? `<section><h2>Additional specifications</h2>${specList(p.additional)}</section>` : "";
  const specs = p.specs && Object.keys(p.specs).length
    ? `<section><h2>Specifications</h2>${specList(p.specs)}</section>` : "";

  root.innerHTML = `
    <div class="product-top">
      <div>
        <div class="gallery-frame">
          <img id="main-image" class="gallery-main" src="${esc(images[0])}" alt="${esc(p.name)}">
          ${images.length > 1 ? `<button class="gallery-nav prev" type="button" aria-label="Previous image">&#8249;</button>
          <button class="gallery-nav next" type="button" aria-label="Next image">&#8250;</button>` : ""}
        </div>
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
  const thumbs = [...root.querySelectorAll(".thumb")];
  let current = 0;
  function show(i) {
    current = (i + images.length) % images.length;
    main.src = images[current];
    thumbs.forEach((b, n) => b.setAttribute("aria-current", String(n === current)));
  }
  thumbs.forEach((btn, i) => btn.addEventListener("click", () => show(i)));
  root.querySelector(".gallery-nav.prev")?.addEventListener("click", () => show(current - 1));
  root.querySelector(".gallery-nav.next")?.addEventListener("click", () => show(current + 1));
  if (images.length > 1) {
    document.addEventListener("keydown", (e) => {
      if (e.target.closest("input, textarea, select")) return;
      if (e.key === "ArrowLeft") show(current - 1);
      else if (e.key === "ArrowRight") show(current + 1);
    });
    // swipe on touch screens
    let x0 = null;
    main.addEventListener("touchstart", (e) => { x0 = e.touches[0].clientX; }, { passive: true });
    main.addEventListener("touchend", (e) => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0; x0 = null;
      if (Math.abs(dx) > 40) show(current + (dx < 0 ? 1 : -1));
    });
  }
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
