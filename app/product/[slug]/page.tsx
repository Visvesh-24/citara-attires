import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProduct, products, relatedProducts } from "@/lib/products";
import { formatPrice } from "@/lib/format";
import { shopHref, site } from "@/lib/site";
import { productUrl } from "@/lib/whatsapp";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductDetails } from "@/components/product/ProductDetails";
import { ProductCard } from "@/components/product/ProductCard";
import { Reveal } from "@/components/ui/Reveal";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = getProduct((await params).slug);
  if (!product) return {};
  const title = `${product.name} — ${formatPrice(product.price)}`;
  const image = product.images[0]?.src ?? "/logo.png";
  return {
    title,
    description: product.description,
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: {
      title: `${title} | ${site.name}`,
      description: product.description,
      url: `/product/${product.slug}`,
      images: [{ url: image, alt: product.name }],
    },
    twitter: { card: "summary_large_image", title, description: product.description, images: [image] },
    other: {
      "product:price:amount": String(product.price),
      "product:price:currency": "INR",
      "product:availability": product.inStock ? "in stock" : "out of stock",
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const product = getProduct((await params).slug);
  if (!product) notFound();
  const related = relatedProducts(product);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    sku: product.sku,
    description: product.description,
    category: product.category,
    image: product.images.map((i) => `${site.url}${i.src}`),
    brand: { "@type": "Brand", name: site.name },
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "INR",
      availability: product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: productUrl(product.slug),
    },
  };

  return (
    <div className="pt-28 pb-28 lg:pt-36 lg:pb-0">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="container-x">
        <nav className="mb-6 flex gap-2 text-[11px] tracking-[0.18em] text-muted uppercase" aria-label="Breadcrumb">
          <Link href="/shop" className="hover:text-gold-700">Shop</Link>
          <span>/</span>
          <Link href={shopHref(product.category)} className="hover:text-gold-700">{product.category}</Link>
        </nav>

        <div className="grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-20">
          <Reveal y={20} className="lg:sticky lg:top-28 lg:self-start">
            <ProductGallery images={product.images} name={product.name} category={product.category} />
          </Reveal>
          <Reveal y={20} delay={0.1} className="lg:py-4">
            <ProductDetails product={product} />
          </Reveal>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-24 border-t border-gold-500/20 bg-ivory py-20 lg:mt-32 lg:py-28">
          <div className="container-x">
            <Reveal>
              <p className="eyebrow text-gold-700">{product.category}</p>
              <h2 className="mt-3 font-display text-[clamp(2.2rem,5vw,4rem)] leading-none font-light text-emerald-900">
                You may also like
              </h2>
            </Reveal>
            <div className="no-scrollbar -mx-5 mt-10 flex snap-x scroll-px-5 gap-4 overflow-x-auto px-5 sm:-mx-8 sm:px-8 lg:mx-0 lg:grid lg:grid-cols-4 lg:gap-6 lg:overflow-visible lg:px-0">
              {related.map((p, i) => (
                <Reveal key={p.slug} delay={i * 0.08} className="w-[62%] shrink-0 snap-start sm:w-[40%] lg:w-auto">
                  <ProductCard product={p} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
