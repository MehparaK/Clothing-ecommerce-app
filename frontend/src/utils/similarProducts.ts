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
  const resultLimit = Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : 0;
  if (resultLimit === 0) return [];

  const currentId = currentProduct?._id;
  const currentCategory = typeof currentProduct?.category === 'string'
    ? currentProduct.category.trim().toLocaleLowerCase()
    : '';
  const currentPrice = Number.isFinite(currentProduct?.price) ? currentProduct.price : null;
  const others = (Array.isArray(allProducts) ? allProducts : []).filter(
    (product) => product && product._id !== currentId
  );
  const priceRange = currentPrice === null ? null : currentPrice * 0.3;

  const sameCategoryAndPrice = others.filter(
    (product) =>
      currentCategory !== '' &&
      typeof product.category === 'string' &&
      product.category.trim().toLocaleLowerCase() === currentCategory &&
      currentPrice !== null &&
      priceRange !== null &&
      Number.isFinite(product.price) &&
      Math.abs(product.price - currentPrice) <= priceRange
  );

  if (sameCategoryAndPrice.length >= resultLimit) {
    return sameCategoryAndPrice.slice(0, resultLimit);
  }

  const sameCategory = others.filter(
    (product) =>
      currentCategory !== '' &&
      typeof product.category === 'string' &&
      product.category.trim().toLocaleLowerCase() === currentCategory &&
      !sameCategoryAndPrice.some((similar) => similar._id === product._id)
  );

  const combined = [...sameCategoryAndPrice, ...sameCategory];
  if (combined.length >= resultLimit) {
    return combined.slice(0, resultLimit);
  }

  const byPrice = others.filter(
    (product) => !combined.some((similar) => similar._id === product._id)
  );
  if (currentPrice !== null) {
    byPrice.sort((a, b) => {
      const aPrice = Number.isFinite(a.price) ? Math.abs(a.price - currentPrice) : Infinity;
      const bPrice = Number.isFinite(b.price) ? Math.abs(b.price - currentPrice) : Infinity;
      return aPrice - bPrice;
    });
  }

  return [...combined, ...byPrice].slice(0, resultLimit);
};