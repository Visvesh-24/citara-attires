const ORDER = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "2XL", "3XL", "XXXL", "4XL", "5XL", "FREE SIZE"];

export function sortSizes(sizes: Iterable<string>) {
  const rank = (s: string) => {
    const i = ORDER.indexOf(s.toUpperCase());
    return i === -1 ? ORDER.length : i;
  };
  return [...sizes].sort((a, b) => rank(a) - rank(b) || a.localeCompare(b, undefined, { numeric: true }));
}
