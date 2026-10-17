const inr = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

export const formatPrice = (price: number) => `₹${inr.format(price)}`;
