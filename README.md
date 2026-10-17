# Citara Attires

Website for **Citara Attires**, a modern ethnic wear brand for women. It's a static catalogue: no cart, no checkout and no login. Customers choose a size and colour, then tap **Buy on WhatsApp**, which opens WhatsApp with their order already typed out.

**Stack:** Next.js (App Router, statically generated), TypeScript, Tailwind CSS v4, Framer Motion and `next/font`. Built for Vercel.

---

## Quick start

```bash
npm install
cp .env.example .env.local   # then edit the values
npm run dev                  # http://localhost:3000
```

`npm run dev` and `npm run build` both run the product import first, so the site always matches the CSV.

## Environment variables

| Variable | Example | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | `918778591551` | WhatsApp number in international format, **digits only, no `+`**. Defaults to +91 87785 91551 if not set |
| `NEXT_PUBLIC_SITE_URL` | `https://citara-attires.vercel.app` | Public URL with no trailing slash. Used in WhatsApp messages, Open Graph tags and the sitemap. Defaults to https://citara-attires.vercel.app |

Never commit `.env` or `.env.local`. They are already listed in `.gitignore`.

## Deploying on Vercel

1. Push this repo to GitHub.
2. On [vercel.com](https://vercel.com): **Add New → Project**, then import the repository. Vercel detects Next.js automatically, so you can keep the default build settings.
3. Under **Environment Variables**, add both variables for **Production** (and Preview if you like):
   - `NEXT_PUBLIC_WHATSAPP_NUMBER` = `918778591551` (optional; this is already the default)
   - `NEXT_PUBLIC_SITE_URL` = your final domain, e.g. `https://citaraattires.com`
4. Click **Deploy**.
5. Optional: add your own domain under **Settings → Domains**, then update `NEXT_PUBLIC_SITE_URL` to match and redeploy.

> `NEXT_PUBLIC_*` values are baked in at build time. After changing one, **redeploy** (Deployments → ⋯ → Redeploy).

## Managing products

The single source of truth is **`data/products.csv`**:

```
sku,name,category,price,sizes,colors,description,image_files,in_stock
```

- Values that can have more than one entry (`sizes`, `colors`, `image_files`) are separated by `|`, e.g. `S|M|L|XL`.
- `category` must be one of **Kurtis**, **Tunics** or **Salwar Sets**.
- `in_stock` is `yes` or `no`. A `no` product shows "Out of stock" instead of the WhatsApp button.
- New arrivals: rows **lower down in the CSV count as newer**. The home page shows the last 8.

`scripts/import-products.ts` (`npm run import-products`) converts the CSV into `data/generated/products.json`, generates URL slugs and prints a report:

- **Errors** (row is skipped): duplicate SKU, missing or invalid price, category outside the 3 allowed, no sizes, missing name.
- **Warnings** (row is kept): image files that don't exist in `public/products/`, missing colours or description.

Set `IMPORT_STRICT=1` to make the build fail on errors instead of skipping the rows.

## Adding photos (no code changes needed)

| What | Where |
| --- | --- |
| Product photos | `public/products/<file named in image_files>` e.g. `public/products/CT-KRT-001-1.jpg` |
| Home hero (left / mobile) | `public/hero/hero-1.jpg` |
| Home hero (right, desktop) | `public/hero/hero-2.jpg` |
| Brand story image | `public/hero/story.jpg` |
| About page / story inset | `public/hero/about.jpg` |

Any missing image is replaced by a branded placeholder, and missing images never break the build. Portrait photos (3:4) look best. The first image of each product is used for its card, the WhatsApp/Open Graph preview and (for the first product with a photo) its category tile. The second image appears when hovering over the card.

## Project structure

```
app/                  routes: /, /shop, /product/[slug], /about, /contact, sitemap, robots
components/home/      landing page sections
components/product/   product card, gallery, details + WhatsApp button
components/shop/      shop filters / sort / search / load more
components/layout/    header, announcement bar, footer, logo
components/ui/        icons, image + placeholder, reveal animations, buttons
lib/                  site config, product data access, WhatsApp link builder
scripts/              CSV → JSON import
data/products.csv     product data (edit this)
```

Brand colours (emerald, gold, ivory, sand) are Tailwind theme tokens in `app/globals.css`. The Instagram handle and announcement texts are in `lib/site.ts`.
