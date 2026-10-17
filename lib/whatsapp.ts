import { site } from "./site";
import { formatPrice } from "./format";
import type { Product } from "./products";

export function whatsappLink(text: string) {
  return `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(text)}`;
}

export function productUrl(slug: string) {
  return `${site.url}/product/${slug}`;
}

export function productEnquiryLink(product: Product, size: string, color: string) {
  const message = [
    "Hi Citara Attires! I'm interested in this:",
    `${product.name} (${product.sku})`,
    `Size: ${size}`,
    `Color: ${color || "As pictured"}`,
    `Price: ${formatPrice(product.price)}`,
    productUrl(product.slug),
  ].join("\n");
  return whatsappLink(message);
}

export const generalEnquiryLink = () =>
  whatsappLink("Hi Citara Attires! I'd love to know more about your collection.");
