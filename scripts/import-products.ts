/**
 * Converts data/products.csv into data/generated/products.json, the file the site reads.
 * Also detects which hero/story photos exist in public/hero/.
 *
 * Run: npm run import-products   (runs automatically before `dev` and `build`)
 *
 * The CSV is hand-edited, so the importer is forgiving:
 *  - blank rows are ignored; header names are case/space-insensitive
 *  - sizes/colours/images may be separated by "|", "," or spaces; stock counts like "M-2" are stripped
 *  - category names are normalised ("Co-ord set" → "Co-ord Sets")
 *  - image names are matched loosely: extension, case, spaces and the macOS " Small" suffix are ignored,
 *    and photos named after the product code (e.g. "CA-SWR-12 Small.jpeg") are picked up automatically.
 *    data/image-overrides.json pins photos where the CSV is ambiguous.
 *
 * Rows with real errors (missing price, unknown category...) are skipped and reported.
 * Missing images are only warnings: the site shows a branded placeholder instead.
 * Set IMPORT_STRICT=1 to fail the build on errors.
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { loadEnvConfig } from "@next/env";

const ROOT = process.cwd();
loadEnvConfig(ROOT); // read .env / .env.local like Next.js does
const CSV_PATH = path.join(ROOT, "data", "products.csv");
const OVERRIDES_PATH = path.join(ROOT, "data", "image-overrides.json");
const OUT_DIR = path.join(ROOT, "data", "generated");
const PRODUCTS_DIR = path.join(ROOT, "public", "products");
const HERO_DIR = path.join(ROOT, "public", "hero");

// Keep in sync with lib/site.ts
const CATEGORIES = ["Kurtis", "Tunics", "Co-ord Sets", "Salwar Sets"] as const;
type Category = (typeof CATEGORIES)[number];

const CATEGORY_ALIASES: Record<string, Category> = {
  kurti: "Kurtis",
  kurtis: "Kurtis",
  tunic: "Tunics",
  tunics: "Tunics",
  "co-ord set": "Co-ord Sets",
  "co-ord sets": "Co-ord Sets",
  "coord set": "Co-ord Sets",
  "coord sets": "Co-ord Sets",
  "co ord set": "Co-ord Sets",
  "co ord sets": "Co-ord Sets",
  "salwar set": "Salwar Sets",
  "salwar sets": "Salwar Sets",
  salwar: "Salwar Sets",
  "salwar suit": "Salwar Sets",
  "salwar suits": "Salwar Sets",
};

// Obvious spelling slips in names/descriptions, fixed for display and reported so the CSV can be corrected.
const SPELLING: Record<string, string> = {
  lurti: "kurti",
  embelished: "embellished",
  salware: "salwar",
  tuquoise: "turquoise",
};

const REQUIRED_COLUMNS = ["sku", "name", "category", "price", "sizes", "colors", "description", "image_files", "in_stock"];

const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".avif"];

type ImageRef = { src: string; blur?: string };

type Product = {
  sku: string;
  slug: string;
  name: string;
  category: Category;
  price: number; // what the customer pays (the discounted price when there is one)
  mrp?: number; // original price, only when discounted
  sizes: string[];
  colors: string[];
  description: string;
  images: ImageRef[];
  inStock: boolean;
  group?: string; // same design in other colours shares a group
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
  return rows;
}

// ---------- text helpers ----------
const squash = (s: string) => s.replace(/\s+/g, " ").trim();

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

function fixSpelling(s: string, onFix: (from: string, to: string) => void) {
  return s.replace(/[A-Za-z]+/g, (word) => {
    const fix = SPELLING[word.toLowerCase()];
    if (!fix) return word;
    const out = word[0] === word[0].toUpperCase() ? fix[0].toUpperCase() + fix.slice(1) : fix;
    onFix(word, out);
    return out;
  });
}

const SMALL_WORDS = new Set(["a", "an", "and", "as", "at", "by", "for", "in", "of", "on", "or", "the", "to", "with"]);
/** "Madras checks Side Knot kurti" → "Madras Checks Side Knot Kurti" (keeps "with", "&" etc. lower case). */
function titleCase(s: string) {
  return squash(s)
    .split(" ")
    .map((w, i) => {
      if (i > 0 && SMALL_WORDS.has(w.toLowerCase())) return w.toLowerCase();
      if (/[A-Z]/.test(w.slice(1))) return w; // already has deliberate capitals
      return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
    })
    .join(" ");
}

function sentence(s: string) {
  const t = squash(s).replace(/\s+([.,!?])/g, "$1");
  if (!t) return "";
  return /[.!?]$/.test(t) ? t : `${t}.`;
}

const SIZE_ORDER = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "2XL", "3XL", "XXXL", "4XL", "5XL", "FREE SIZE"];
const sizeRank = (s: string) => {
  const i = SIZE_ORDER.indexOf(s);
  return i === -1 ? SIZE_ORDER.length : i;
};

/** "XS-2, S-1, M-3" → ["XS","S","M"]; also accepts "|" separators and duplicates. */
function parseSizes(raw: string) {
  let hadCounts = false;
  const sizes = raw
    .split(/[|,/]/)
    .map((s) => squash(s).toUpperCase())
    .filter(Boolean)
    .map((s) => {
      const m = s.match(/^(.+?)\s*-\s*\d+$/);
      if (m) hadCounts = true;
      return m ? m[1] : s;
    });
  const unique = [...new Set(sizes)].sort((a, b) => sizeRank(a) - sizeRank(b));
  return { sizes: unique, hadCounts, hadDuplicates: unique.length < sizes.length };
}

const parseList = (raw: string) =>
  [...new Set(raw.split(/[|,]/).map((s) => titleCase(s)).filter(Boolean))];

const parseMoney = (raw: string) => {
  const cleaned = raw.replace(/[₹,\s]|rs\.?/gi, "");
  if (!cleaned) return { value: undefined, invalid: false };
  const value = Number(cleaned);
  return Number.isFinite(value) && value > 0 ? { value, invalid: false } : { value: undefined, invalid: true };
};

// ---------- image matching ----------
/** "CA-KRT-01-1 Small.jpeg", "ca-krt-01-1.jpg", "CA-KRT-01-1" → "ca-krt-01-1" */
function imageKey(name: string) {
  let base = squash(name).toLowerCase();
  const ext = path.extname(base);
  if (IMAGE_EXTENSIONS.includes(ext)) base = base.slice(0, -ext.length);
  return base.replace(/[\s_-]*small$/, "").replace(/\s+/g, "");
}

/** "CA-SWR-03-1" → "ca-swr-03": the design code shared by all photos of a product. */
const productCode = (sku: string) => sku.toLowerCase().split("-").slice(0, 3).join("-");

/** Natural order: "x-12" < "x-12-1" < "x-12-1(1)" < "x-12-2". */
const naturalCompare = (a: string, b: string) => a.localeCompare(b, undefined, { numeric: true });

type ImageFile = { file: string; key: string; hash: string; width?: number };

// ---------- optional blur placeholders + dimensions (uses sharp when available) ----------
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

async function widthOf(file: string): Promise<number | undefined> {
  const sharp = await loadSharp();
  if (!sharp) return undefined;
  try {
    return (await sharp(file).metadata()).width;
  } catch {
    return undefined;
  }
}

// ---------- main ----------
async function main() {
  const errors: string[] = [];
  const warnings: string[] = [];
  const fixes: string[] = [];

  if (!fs.existsSync(CSV_PATH)) {
    console.error(`✖ ${path.relative(ROOT, CSV_PATH)} not found.`);
    process.exit(1);
  }

  const allRows = parseCsv(fs.readFileSync(CSV_PATH, "utf8"));
  const header = (allRows.shift() ?? []).map((h) => squash(h).toLowerCase().replace(/[\s-]+/g, "_"));
  const missingCols = REQUIRED_COLUMNS.filter((c) => !header.includes(c));
  if (missingCols.length) {
    console.error(`✖ CSV is missing required columns: ${missingCols.join(", ")}`);
    process.exit(1);
  }
  const discountCol = ["discount_price", "sale_price", "offer_price"].find((c) => header.includes(c));
  const col = (r: string[], name: string | undefined) => (name ? squash(r[header.indexOf(name)] ?? "") : "");

  // Index every photo in public/products/
  const files: ImageFile[] = [];
  if (fs.existsSync(PRODUCTS_DIR)) {
    for (const file of fs.readdirSync(PRODUCTS_DIR).sort(naturalCompare)) {
      if (!IMAGE_EXTENSIONS.includes(path.extname(file).toLowerCase())) continue;
      const abs = path.join(PRODUCTS_DIR, file);
      files.push({
        file,
        key: imageKey(file),
        hash: crypto.createHash("md5").update(fs.readFileSync(abs)).digest("hex"),
        width: await widthOf(abs),
      });
    }
  }
  const fileByKey = new Map(files.map((f) => [f.key, f]));

  const overrides: Record<string, string[]> = fs.existsSync(OVERRIDES_PATH)
    ? Object.fromEntries(
        Object.entries(JSON.parse(fs.readFileSync(OVERRIDES_PATH, "utf8"))).filter(([k]) => !k.startsWith("_")),
      ) as Record<string, string[]>
    : {};
  const overriddenKeys = new Set(Object.values(overrides).flat().map(imageKey));
  const usedOverrides = new Set<string>();

  type Draft = Omit<Product, "slug" | "images" | "group"> & { line: number; imageTokens: string[] };
  const drafts: Draft[] = [];
  let blankRows = 0;

  for (let i = 0; i < allRows.length; i++) {
    const r = allRows[i];
    const line = i + 2; // +1 for header, +1 for 1-based line numbers
    if (r.every((cell) => !cell.trim())) {
      blankRows++;
      continue;
    }
    const sku = col(r, "sku").toUpperCase();
    const where = `line ${line}${sku ? ` (${sku})` : ""}`;
    const rowErrors: string[] = [];
    const onFix = (from: string, to: string) => fixes.push(`${where}: "${from}" → "${to}"`);

    if (!sku) rowErrors.push("missing SKU");

    const name = titleCase(fixSpelling(col(r, "name"), onFix));
    if (!name) rowErrors.push("missing name");

    const mrp = parseMoney(col(r, "price"));
    const sale = parseMoney(col(r, discountCol));
    if (mrp.invalid) rowErrors.push(`invalid price "${col(r, "price")}"`);
    if (sale.invalid) warnings.push(`${where}: invalid discount price "${col(r, discountCol)}" ignored`);
    let price = sale.value ?? mrp.value;
    let original = sale.value && mrp.value && sale.value < mrp.value ? mrp.value : undefined;
    if (sale.value && mrp.value && sale.value >= mrp.value) {
      warnings.push(`${where}: discount price ₹${sale.value} is not below price ₹${mrp.value}, showing ₹${mrp.value}`);
      price = mrp.value;
      original = undefined;
    }
    if (!price && !mrp.invalid) rowErrors.push("missing price");

    const rawCategory = col(r, "category");
    const category =
      CATEGORIES.find((c) => c === rawCategory) ?? CATEGORY_ALIASES[rawCategory.toLowerCase().replace(/\s+/g, " ")];
    if (!category)
      rowErrors.push(
        rawCategory ? `category "${rawCategory}" is not one of: ${CATEGORIES.join(", ")}` : "missing category",
      );

    const { sizes, hadCounts, hadDuplicates } = parseSizes(col(r, "sizes"));
    if (!sizes.length) rowErrors.push("no sizes listed (customers must pick a size to order)");
    if (hadCounts) warnings.push(`${where}: sizes "${col(r, "sizes")}" contain stock counts, using ${sizes.join(", ")}`);
    else if (hadDuplicates) warnings.push(`${where}: duplicate sizes in "${col(r, "sizes")}"`);

    const colors = parseList(col(r, "colors"));
    if (!colors.length) warnings.push(`${where}: no colours listed`);

    const description = sentence(fixSpelling(col(r, "description"), onFix));
    if (!description) warnings.push(`${where}: missing description`);

    const rawStock = col(r, "in_stock").toLowerCase();
    let inStock = true;
    if (["no", "n", "false", "0", "out of stock"].includes(rawStock)) inStock = false;
    else if (!["yes", "y", "true", "1", ""].includes(rawStock))
      warnings.push(`${where}: in_stock "${col(r, "in_stock")}" is not yes/no, treating as "yes"`);

    if (rowErrors.length) {
      errors.push(`${where}: ${rowErrors.join("; ")} → row skipped`);
      continue;
    }

    const imageTokens = col(r, "image_files")
      .split(/[|,\s]+/)
      .filter(Boolean)
      // re-join names that were split on the space before "Small" ("CA-KRT-01-1 Small.jpeg")
      .reduce<string[]>((acc, t) => {
        if (/^small(\.\w+)?$/i.test(t) && acc.length) acc[acc.length - 1] += ` ${t}`;
        else acc.push(t);
        return acc;
      }, []);

    drafts.push({
      line,
      sku,
      name,
      category: category!,
      price: price!,
      mrp: original,
      sizes,
      colors,
      description,
      inStock,
      imageTokens,
    });
  }

  // Duplicate SKUs: identical rows are dropped; different products sharing a SKU are both kept (and reported).
  const bySku = new Map<string, Draft[]>();
  for (const d of drafts) bySku.set(d.sku, [...(bySku.get(d.sku) ?? []), d]);
  const kept: Draft[] = [];
  for (const d of drafts) {
    const same = bySku.get(d.sku)!;
    if (same.length === 1) {
      kept.push(d);
      continue;
    }
    const twin = kept.find(
      (k) => k.sku === d.sku && k.name === d.name && k.colors.join() === d.colors.join() && k.price === d.price,
    );
    if (twin) {
      errors.push(`line ${d.line} (${d.sku}): exact duplicate of line ${twin.line} → row skipped`);
      continue;
    }
    if (same[0] === d)
      warnings.push(
        `${d.sku} is used by ${same.length} different products (lines ${same.map((s) => s.line).join(", ")}) → all kept; give each a unique SKU`,
      );
    kept.push(d);
  }

  // Images: overrides → CSV names → photos named after the product code.
  const codeCount = new Map<string, number>();
  for (const d of kept) codeCount.set(productCode(d.sku), (codeCount.get(productCode(d.sku)) ?? 0) + 1);
  const usedFiles = new Set<string>();
  const products: Product[] = [];
  const seenSlugs = new Set<string>();

  for (const d of kept) {
    const where = `line ${d.line} (${d.sku})`;
    const overrideKey = [`${d.sku}|${d.colors[0] ?? ""}`, d.sku].find((k) => k in overrides);
    const picked: ImageFile[] = [];
    const add = (f: ImageFile | undefined) => {
      if (f && !picked.some((p) => p.hash === f.hash)) picked.push(f); // skip byte-identical copies
    };

    if (overrideKey) {
      usedOverrides.add(overrideKey);
      for (const name of overrides[overrideKey]) {
        const f = fileByKey.get(imageKey(name));
        if (f) add(f);
        else warnings.push(`${where}: image-overrides.json names "${name}", which isn't in public/products/`);
      }
    } else {
      for (const token of d.imageTokens) {
        const f = fileByKey.get(imageKey(token));
        if (f && !overriddenKeys.has(f.key)) add(f);
        else if (!f) warnings.push(`${where}: image not found: ${token}`);
      }
      // Pick up photos named after the design code ("CA-SWR-12 Small.jpeg", "CA-SWR-03-1(1) Small.jpeg"),
      // unless several products share that code, which would make the match a guess.
      const code = productCode(d.sku);
      if (codeCount.get(code) === 1) {
        const pattern = new RegExp(`^${code.replace(/[-]/g, "\\-")}($|[-(])`);
        const extra = files.filter((f) => pattern.test(f.key) && !overriddenKeys.has(f.key));
        const before = picked.length;
        extra.forEach(add);
        if (picked.length > before && d.imageTokens.length === 0)
          fixes.push(`${where}: no image_files in CSV, matched ${picked.map((p) => p.file).join(", ")} by product code`);
      }
    }
    picked.forEach((p) => usedFiles.add(p.file));
    if (!picked.length) warnings.push(`${where}: no photo found → placeholder shown`);

    // Same name in several colours → every one of them gets the colour in its URL.
    let slug = slugify(d.name) || slugify(d.sku);
    if (kept.filter((k) => k.name === d.name).length > 1 || seenSlugs.has(slug))
      slug = `${slug}-${slugify(d.colors[0] ?? "")}`.replace(/-$/, "");
    if (seenSlugs.has(slug)) slug = `${slug}-${slugify(d.sku)}`;
    seenSlugs.add(slug);

    const images: ImageRef[] = [];
    for (const p of picked) {
      images.push({ src: `/products/${encodeURIComponent(p.file)}`, blur: await blurFor(path.join(PRODUCTS_DIR, p.file)) });
    }

    const { line: _line, imageTokens: _tokens, ...rest } = d;
    products.push({ ...rest, slug, images });
  }

  // Same design in other colours: name minus its colour words, e.g. "Sage Green Floral Kurti Set" → "floral kurti set".
  const groupKey = (p: Product) => {
    const colourWords = new Set(p.colors.join(" ").toLowerCase().split(/\s+/));
    return p.category + ":" + p.name.toLowerCase().split(/\s+/).filter((w) => !colourWords.has(w)).join(" ");
  };
  const groups = new Map<string, Product[]>();
  for (const p of products) groups.set(groupKey(p), [...(groups.get(groupKey(p)) ?? []), p]);
  for (const [key, members] of groups) if (members.length > 1) members.forEach((p) => (p.group = slugify(key)));

  for (const key of Object.keys(overrides))
    if (!usedOverrides.has(key)) warnings.push(`image-overrides.json: "${key}" doesn't match any product`);

  const unused = files.filter((f) => !usedFiles.has(f.file));
  const duplicatesOfUsed = unused.filter((f) => files.some((u) => usedFiles.has(u.file) && u.hash === f.hash));
  const orphans = unused.filter((f) => !duplicatesOfUsed.includes(f));
  orphans.forEach((f) => warnings.push(`public/products/${f.file} isn't used by any product`));
  const lowRes = files.filter((f) => f.width && f.width < 600);

  // Hero / story photos: optional, placeholder design when missing.
  const siteImages: Record<string, ImageRef | null> = {};
  for (const key of ["hero-1", "hero-2", "story", "about"]) {
    const found = IMAGE_EXTENSIONS.map((ext) => `${key}${ext}`).find((f) => fs.existsSync(path.join(HERO_DIR, f)));
    siteImages[key] = found ? { src: `/hero/${found}`, blur: await blurFor(path.join(HERO_DIR, found)) } : null;
    if (!found && key !== "about") warnings.push(`public/hero/${key}.jpg not found → placeholder design used`);
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(path.join(OUT_DIR, "products.json"), JSON.stringify(products, null, 2));
  fs.writeFileSync(path.join(OUT_DIR, "site-images.json"), JSON.stringify(siteImages, null, 2));

  // ---------- report ----------
  const byCategory = CATEGORIES.map((c) => `${c}: ${products.filter((p) => p.category === c).length}`);
  const withPhotos = products.filter((p) => p.images.length).length;
  console.log("\n━━━━━━━━ Citara Attires · product import ━━━━━━━━");
  console.log(`Rows read:        ${allRows.length} (${blankRows} blank)`);
  console.log(`Products written: ${products.length}  (${byCategory.join(", ")})`);
  console.log(`With photos:      ${withPhotos} of ${products.length}  ·  ${usedFiles.size} of ${files.length} image files used`);
  if (duplicatesOfUsed.length)
    console.log(`Identical copies: ${duplicatesOfUsed.length} file(s) skipped (${duplicatesOfUsed.map((f) => f.file).join(", ")})`);
  console.log(`On sale:          ${products.filter((p) => p.mrp).length}  ·  Out of stock: ${products.filter((p) => !p.inStock).length}`);
  if (lowRes.length)
    console.log(
      `Low resolution:   ${lowRes.length} photo(s) under 600px wide (e.g. ${lowRes[0].file}, ${lowRes[0].width}px) → upload larger originals for sharper pages`,
    );

  if (errors.length) {
    console.log(`\n✖ ${errors.length} error(s):`);
    errors.forEach((e) => console.log(`  • ${e}`));
  }
  if (fixes.length) {
    console.log(`\n✎ ${fixes.length} automatic fix(es):`);
    fixes.forEach((f) => console.log(`  • ${f}`));
  }
  if (warnings.length) {
    console.log(`\n⚠ ${warnings.length} warning(s):`);
    const shown = warnings.slice(0, 80);
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
