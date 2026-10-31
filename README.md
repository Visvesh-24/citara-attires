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
sku,name,category,Discount price,price,sizes,colors,description,image_files,in_stock
```

- **`price`** is the original price (MRP). **`Discount price`** is optional: when it is lower, the site shows it as the selling price with the MRP struck through and a "% off" label. The WhatsApp message uses the selling price.
- **`category`** must be one of **Kurtis**, **Tunics**, **Co-ord Sets** or **Salwar Sets**. Singular forms and small variations ("Co-ord set", "Salwar set") are accepted.
- **`sizes`**, **`colors`** and **`image_files`** can be separated by `|`, commas or (for images) spaces. Stock counts written into sizes, like `M-2`, are removed automatically.
- **`in_stock`** is `yes` or `no` (any capitalisation). A `no` product shows "Out of stock" instead of the WhatsApp button.
- **`description`** is optional. If it's blank, the section is simply hidden.
- **New arrivals:** rows **lower down in the CSV count as newer**. The home page shows the newest 8, mixed across categories.
- **Colours:** each colour of a design is its own row and its own product, with its own photos and page. A row with **no photo** whose design is also listed in other colours that do have photos (e.g. a "Grey Floral Kurti Set" next to the photographed Sage, Violet and Turquoise sets) is treated as an umbrella listing and left off the site. The import report names it.
- Each SKU should be unique. Names are shown in Title Case, and a few obvious typos are corrected for display (the import report lists them so you can fix the CSV too).

`scripts/import-products.ts` (`npm run import-products`) converts the CSV into `data/generated/products.json`, generates URL slugs, matches photos and prints a report:

- **Errors** (row is skipped): missing or invalid price, category outside the 4 above, no sizes, missing name, exact duplicate rows.
- **Fixes** (applied automatically): typos, photos matched by product code.
- **Warnings** (row is kept): duplicate SKUs on different products, photos listed but not found, stock counts in sizes, missing description, unused photo files.

Set `IMPORT_STRICT=1` to make the build fail on errors instead of skipping the rows.

## Product photos

Put photos in **`public/products-large/`** (preferred) or **`public/products/`**. If the same photo exists in both, the large one is used. Matching is forgiving, so the CSV doesn't need exact filenames:

1. Names in `image_files` are matched while ignoring capitalisation, spaces, the extension and the macOS ` Large`/` Small` suffix. For example, `CA-KRT-01-1.jpg` matches `CA-KRT-01-1 Large.jpeg`.
2. Photos named after the product code are picked up automatically, even if `image_files` is empty. For SKU `CA-SWR-12-1`, that means `CA-SWR-12 Large.jpeg`, `CA-SWR-12-1 Large.jpeg`, `CA-SWR-12-2 …`.
3. **`data/image-overrides.json`** pins photos where the CSV is ambiguous (two products sharing a SKU, or photo numbers that don't line up with the SKUs). It currently holds the matches I checked visually for the floral kurti sets and the two CA-TUN-14 tunics.
4. Byte-identical copies (e.g. `CA-SWR-03-1(1) Large.jpeg`) are shown only once.

The first photo is the main one: it's used for the product card, the WhatsApp/Open Graph preview and (for the first product in each category) the category tile. The second photo appears when hovering over a card. A product with no photo shows a branded placeholder, and missing photos never break the build. Portrait photos (3:4) at least 900px wide look best; the current large photos are 960×1280.

| Site photo | Where |
| --- | --- |
| Home hero (left / mobile) | `public/hero/hero-1.jpg` |
| Home hero (right, desktop) | `public/hero/hero-2.jpg` |
| Brand story image | `public/hero/story.jpg` |
| About page / story inset | `public/hero/about.jpg` |

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
