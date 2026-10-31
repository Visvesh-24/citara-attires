const inr = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

export const formatPrice = (price: number) => `₹${inr.format(price)}`;

/** Whole-number discount, e.g. 750 → 680 is "9" (% off). */
export const discountPercent = (price: number, mrp?: number) => (mrp && mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0);
