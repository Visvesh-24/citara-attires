export const CATEGORIES = ["Kurtis", "Tunics", "Salwar Sets"] as const;
export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_COPY: Record<Category, string> = {
  Kurtis: "Everyday grace, effortless drape",
  Tunics: "Light, breezy, made to move",
  "Salwar Sets": "Complete looks for every celebration",
};

function siteUrl() {
  const url =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL && `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`) ||
    "http://localhost:3000";
  return url.replace(/\/+$/, "");
}

export const site = {
  name: "Citara Attires",
  tagline: "Modern ethnic wear, rooted in tradition",
  description:
    "Citara Attires — kurtis, tunics and salwar sets that blend modern chic with timeless Indian tradition. Order easily on WhatsApp.",
  url: siteUrl(),
  whatsappNumber: (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "").replace(/\D/g, ""),
  instagramHandle: "citara_attires",
  instagramUrl: "https://instagram.com/citara_attires",
  announcement: ["New arrivals every week", "Order on WhatsApp", "Made with love in India"],
};

export const shopHref = (category?: Category) =>
  category ? `/shop?category=${encodeURIComponent(category)}` : "/shop";
