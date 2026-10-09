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
      "category": "pc-builds",          // or "accessories"
      "type": "gaming-pc",              // optional: matches a "Shop by Category" tile
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
- New categories: add them to `CATEGORIES` in `scripts/common.js` and to the category `<select>` in `index.html`.

- "Shop by Category" tiles: edit the `.tile-row` block in `index.html` (link `index.html?type=<type>#catalog`) and the `TYPES` list in `scripts/app.js`; give each product a matching `"type"` in its `details.json`.
