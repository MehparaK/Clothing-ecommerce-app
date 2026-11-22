import type { Product } from '../types';

/**
 * Oxşar məhsulları tapır:
 * 1. Əvvəl eyni category + eyni qiymət aralığı (±30%)
 * 2. Sonra yalnız eyni category
 * 3. Heç biri yoxdursa — ən yaxın qiymətli məhsullar
 */
export const findSimilarProducts = (
  currentProduct: Product,
  allProducts: Product[],
  limit = 4
): Product[] => {
  const others = allProducts.filter((p) => p._id !== currentProduct._id);

  const priceRange = currentProduct.price * 0.3;

  const sameCategoryAndPrice = others.filter(
    (p) =>
      p.category === currentProduct.category &&
      Math.abs(p.price - currentProduct.price) <= priceRange
  );

  if (sameCategoryAndPrice.length >= limit) {
    return sameCategoryAndPrice.slice(0, limit);
  }

  const sameCategory = others.filter(
    (p) =>
      p.category === currentProduct.category &&
      !sameCategoryAndPrice.some((sp) => sp._id === p._id)
  );

  const combined = [...sameCategoryAndPrice, ...sameCategory];
  if (combined.length >= limit) {
    return combined.slice(0, limit);
  }

  const byPrice = others
    .filter((p) => !combined.some((cp) => cp._id === p._id))
    .sort(
      (a, b) =>
        Math.abs(a.price - currentProduct.price) -
        Math.abs(b.price - currentProduct.price)
    );

  return [...combined, ...byPrice].slice(0, limit);
};