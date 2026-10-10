# S TECH STORE: static product catalog

Plain HTML, CSS and vanilla JavaScript. No build step, backend or database.

## Run locally
Product data is loaded with `fetch()`, so opening the HTML files directly (file://) will not work. Use any local server from this folder:

    python3 -m http.server 8000      # then open http://localhost:8000
    # or: npx serve        # or: VS Code "Live Server" extension

## Deploy
Upload the whole folder to any static host. No build settings are needed (leave the build command empty and set the publish directory to the project root).
- **Netlify:** drag and drop the folder at app.netlify.com/drop.
- **GitHub Pages:** push to a repo, then Settings > Pages > deploy from the main branch, root folder.
- **Cloudflare Pages / Vercel:** import the repo, framework "None", output directory `.`

All paths are relative, so the site also works in a sub-folder.

## Manage products
- **Add:** create `products/<new-id>/`, add `details.json` and images, then add `"<new-id>"` to `products/index.json`. Use lowercase letters, numbers and hyphens for the id.
- **Edit:** change `details.json` or replace the image files.
- **Remove:** delete its id from `products/index.json` (and delete the folder if you like).

The product page URL is `product.html?id=<folder-name>`.

### details.json
    {
      "name": "Product name",
      "category": "pc-builds",          // one of the slugs in CATEGORIES (see below)
      "price": 1899,                    // number, USD
      "availability": "In stock",       // "In stock", "Made to order", "Out of stock", ...
      "summary": "One line shown on the card",
      "description": "Paragraph. Use \n for a new paragraph.",
      "images": ["main.jpg", "inside.jpg"],   // first image is the card thumbnail
      "specs": { "CPU": "...", "GPU": "..." },       // any labels you like
      "additional": { "Warranty": "..." }            // optional
    }

Images can be .jpg, .png, .webp or .svg (the samples are .svg placeholders; replace them with real photos and update the file names in `details.json`). Missing images fall back to a grey placeholder, and a product whose `details.json` is missing or broken is skipped in the catalog.

## Customize
- Shop name, contact details and social links: `SHOP` at the top of `scripts/common.js` (header and footer on every page).
- Colors and spacing: variables at the top of `styles/style.css`.
- Categories: edit `CATEGORIES` in `scripts/common.js` (slug -> label). The "Shop by Category" tiles, the category dropdown, the footer links and the category pages all build from it. Valid slugs: `pc-builds`, `monitors`, `graphics-cards`, `processors`, `motherboards`, `ram`, `storage-ssd-hdd`, `power-supplies`, `pc-cases`, `cooling-systems`, `keyboards`, `mice`, `headsets`, `gaming-chair`, `other-accessories`. A category page is `index.html?category=<slug>`.

## Category photos
Each tile uses `images/categories/<slug>.png` (600x450, transparent background). To change a photo, replace that file keeping the same name, e.g. `graphics-cards.png`. A missing file shows a grey placeholder.
