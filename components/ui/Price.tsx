import { discountPercent, formatPrice } from "@/lib/format";

/** Selling price, with the original price struck through when discounted. */
export function Price({
  price,
  mrp,
  size = "sm",
  className = "",
}: {
  price: number;
  mrp?: number;
  size?: "sm" | "lg";
  className?: string;
}) {
  const off = discountPercent(price, mrp);
  return (
    <p className={`flex flex-wrap items-baseline gap-x-2 ${className}`}>
      <span className={size === "lg" ? "text-2xl text-emerald-900" : "text-sm text-emerald-950"}>
        {formatPrice(price)}
      </span>
      {off > 0 && mrp && (
        <>
          <span className={`text-muted line-through decoration-muted/60 ${size === "lg" ? "text-base" : "text-xs"}`}>
            <span className="sr-only">Original price </span>
            {formatPrice(mrp)}
          </span>
          <span className={`text-gold-700 ${size === "lg" ? "text-sm" : "text-[11px]"} tracking-wide`}>{off}% off</span>
        </>
      )}
    </p>
  );
}
