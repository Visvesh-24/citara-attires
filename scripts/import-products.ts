/**
 * Converts data/products.csv into data/generated/products.json, the file the site reads.
 * Also detects which hero/story photos exist in public/hero/.
 *
 * Run: npm run import-products   (runs automatically before `dev` and `build`)
 *
 * Rows with real errors (duplicate SKU, missing price, unknown category...) are
 * skipped and reported. Missing image files are only warnings: the site shows a
 * branded placeholder instead. Set IMPORT_STRICT=1 to fail on errors.
 */
import fs from "node:fs";
import path from "node:path";
import { loadEnvConfig } from "@next/env";

const ROOT = process.cwd();
loadEnvConfig(ROOT); // read .env / .env.local like Next.js does
const CSV_PATH = path.join(ROOT, "data", "products.csv");
const OUT_DIR = path.join(ROOT, "data", "generated");
const PRODUCTS_DIR = path.join(ROOT, "public", "products");
const HERO_DIR = path.join(ROOT, "public", "hero");

const CATEGORIES = ["Kurtis", "Tunics", "Salwar Sets"] as const;
type Category = (typeof CATEGORIES)[number];

const CATEGORY_ALIASES: Record<string, Category> = {
  kurti: "Kurtis",
  kurtis: "Kurtis",
  tunic: "Tunics",
  tunics: "Tunics",
  "salwar set": "Salwar Sets",
  "salwar sets": "Salwar Sets",
  salwar: "Salwar Sets",
  "salwar suit": "Salwar Sets",
  "salwar suits": "Salwar Sets",
};

const REQUIRED_COLUMNS = [
  "sku",
  "name",
  "category",
  "price",
  "sizes",
  "colors",
  "description",
  "image_files",
  "in_stock",
];

type ImageRef = { src: string; blur?: string };

type Product = {
  sku: string;
  slug: string;
  name: string;
  category: Category;
  price: number;
  sizes: string[];
  colors: string[];
  description: string;
  images: ImageRef[];
  inStock: boolean;
};

// ---------- tiny RFC 4180 CSV parser (handles quotes, commas and newlines in fields) ----------
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  const src = text.replace(/^﻿/, "");

  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (inQuotes) {
      if (c === '"' && src[i + 1] === '"') {
        field += '"';
        i++;
      } else if (c === '"') {
        inQuotes = false;
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && src[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += c;
    }
  }
  if (field !== "" || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((cell) => cell.trim() !== ""));
}

const splitMulti = (v: string) =>
  v
    .split("|")
    .map((s) => s.trim())
    .filter(Boolean);

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

// ---------- optional blur placeholders (uses sharp when available) ----------
type Sharp = typeof import("sharp").default;
let sharpLib: Sharp | null | undefined;
async function loadSharp(): Promise<Sharp | null> {
  if (sharpLib !== undefined) return sharpLib;
  try {
    sharpLib = (await import("sharp")).default;
  } catch {
    sharpLib = null;
  }
  return sharpLib;
}

async function blurFor(file: string): Promise<string | undefined> {
  const sharp = await loadSharp();
  if (!sharp) return undefined;
  try {
    const buf = await sharp(file).resize(8, 10, { fit: "cover" }).webp({ quality: 40 }).toBuffer();
    return `data:image/webp;base64,${buf.toString("base64")}`;
  } catch {
    return undefined;
  }
}

// ---------- main ----------
async function main() {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!fs.existsSync(CSV_PATH)) {
    console.error(`✖ ${path.relative(ROOT, CSV_PATH)} not found.`);
    process.exit(1);
  }

  const rows = parseCsv(fs.readFileSync(CSV_PATH, "utf8"));
  const header = (rows.shift() ?? []).map((h) => h.trim().toLowerCase());
  const missingCols = REQUIRED_COLUMNS.filter((c) => !header.includes(c));
  if (missingCols.length) {
    console.error(`✖ CSV is missing required columns: ${missingCols.join(", ")}`);
    process.exit(1);
  }
  const col = (r: string[], name: string) => (r[header.indexOf(name)] ?? "").trim();

  const products: Product[] = [];
  const seenSkus = new Map<string, number>();
  const seenSlugs = new Set<string>();
  let missingImageCount = 0;

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const line = i + 2; // +1 for header, +1 for 1-based line numbers
    const sku = col(r, "sku");
    const where = `line ${line}${sku ? ` (${sku})` : ""}`;
    const rowErrors: string[] = [];

    if (!sku) rowErrors.push("missing SKU");
    else if (seenSkus.has(sku.toUpperCase()))
      rowErrors.push(`duplicate SKU, already used on line ${seenSkus.get(sku.toUpperCase())}`);

    const name = col(r, "name");
    if (!name) rowErrors.push("missing name");

    const rawPrice = col(r, "price").replace(/[₹,\s]/g, "");
    const price = Number(rawPrice);
    if (!rawPrice) rowErrors.push("missing price");
    else if (!Number.isFinite(price) || price <= 0) rowErrors.push(`invalid price "${col(r, "price")}"`);

    const rawCategory = col(r, "category");
    let category = CATEGORIES.find((c) => c === rawCategory);
    if (!category) {
      category = CATEGORY_ALIASES[rawCategory.toLowerCase().replace(/\s+/g, " ")];
      if (category) warnings.push(`${where}: category "${rawCategory}" treated as "${category}"`);
      else
        rowErrors.push(
          rawCategory
            ? `category "${rawCategory}" is not one of: ${CATEGORIES.join(", ")}`
            : "missing category",
        );
    }

    const sizes = splitMulti(col(r, "sizes"));
    if (!sizes.length) rowErrors.push("no sizes listed (customers must pick a size to order)");

    const colors = splitMulti(col(r, "colors"));
    if (!colors.length) warnings.push(`${where}: no colors listed`);

    const description = col(r, "description");
    if (!description) warnings.push(`${where}: missing description`);

    const rawStock = col(r, "in_stock").toLowerCase();
    let inStock = true;
    if (["no", "n", "false", "0"].includes(rawStock)) inStock = false;
    else if (!["yes", "y", "true", "1"].includes(rawStock))
      warnings.push(`${where}: in_stock "${col(r, "in_stock")}" is not yes/no, treating as "yes"`);

    if (rowErrors.length) {
      errors.push(`${where}: ${rowErrors.join("; ")} → row skipped`);
      continue;
    }
    seenSkus.set(sku.toUpperCase(), line);

    const images: ImageRef[] = [];
    const imageFiles = splitMulti(col(r, "image_files"));
    if (!imageFiles.length) warnings.push(`${where}: no image files listed`);
    for (const file of imageFiles) {
      const abs = path.join(PRODUCTS_DIR, file);
      if (fs.existsSync(abs)) {
        images.push({ src: `/products/${encodeURIComponent(file)}`, blur: await blurFor(abs) });
      } else {
        missingImageCount++;
        warnings.push(`${where}: image not found: public/products/${file}`);
      }
    }

    let slug = slugify(name) || slugify(sku);
    if (seenSlugs.has(slug)) slug = `${slug}-${slugify(sku)}`;
    seenSlugs.add(slug);

    products.push({
      sku,
      slug,
      name,
      category: category!,
      price,
      sizes,
      colors,
      description,
      images,
      inStock,
    });
  }

  // Hero / story photos: optional, placeholder design when missing.
  const siteImages: Record<string, ImageRef | null> = {};
  for (const key of ["hero-1", "hero-2", "story", "about"]) {
    const found = ["jpg", "jpeg", "png", "webp", "avif"]
      .map((ext) => `${key}.${ext}`)
      .find((f) => fs.existsSync(path.join(HERO_DIR, f)));
    siteImages[key] = found ? { src: `/hero/${found}`, blur: await blurFor(path.join(HERO_DIR, found)) } : null;
    if (!found && key !== "about") warnings.push(`public/hero/${key}.jpg not found → placeholder design used`);
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(path.join(OUT_DIR, "products.json"), JSON.stringify(products, null, 2));
  fs.writeFileSync(path.join(OUT_DIR, "site-images.json"), JSON.stringify(siteImages, null, 2));

  // ---------- report ----------
  const byCategory = CATEGORIES.map((c) => `${c}: ${products.filter((p) => p.category === c).length}`);
  console.log("\n━━━━━━━━ Citara Attires · product import ━━━━━━━━");
  console.log(`Rows read:        ${rows.length}`);
  console.log(`Products written: ${products.length}  (${byCategory.join(", ")})`);
  console.log(`Out of stock:     ${products.filter((p) => !p.inStock).length}`);
  console.log(`Missing images:   ${missingImageCount} file(s)${missingImageCount ? " → placeholders will be shown" : ""}`);
  if (!process.env.NEXT_PUBLIC_WHATSAPP_NUMBER)
    warnings.push("NEXT_PUBLIC_WHATSAPP_NUMBER is not set → WhatsApp links will open without a recipient");
  if (!process.env.NEXT_PUBLIC_SITE_URL)
    warnings.push("NEXT_PUBLIC_SITE_URL is not set → product links fall back to the Vercel URL or localhost");

  if (errors.length) {
    console.log(`\n✖ ${errors.length} error(s):`);
    errors.forEach((e) => console.log(`  • ${e}`));
  }
  if (warnings.length) {
    console.log(`\n⚠ ${warnings.length} warning(s):`);
    const shown = warnings.slice(0, 60);
    shown.forEach((w) => console.log(`  • ${w}`));
    if (warnings.length > shown.length) console.log(`  … and ${warnings.length - shown.length} more`);
  }
  if (!errors.length && !warnings.length) console.log("\n✔ No problems found.");
  console.log(`\n→ ${path.relative(ROOT, path.join(OUT_DIR, "products.json"))}\n`);

  if (errors.length && process.env.IMPORT_STRICT === "1") process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
