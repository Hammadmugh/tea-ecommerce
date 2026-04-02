/**
 * Calculate variant multiplier based on weight/variant value
 * Base weight is 50g
 */
export const getVariantMultiplier = (variantValue) => {
  const multipliers = {
    '50': 1,
    '100': 2,
    '170': 170 / 50, // 3.4
    '250': 250 / 50, // 5
    '1kg': 1000 / 50, // 20
    'sampler': 0.6,
  };

  const key = String(variantValue || '').trim();
  return multipliers[key] || 1;
};

/**
 * Calculate adjusted price based on variant
 * @param {number} basePrice - Base price of the product
 * @param {string|null} variantValue - Variant value (weight)
 * @returns {number} Adjusted price
 */
export const getAdjustedPrice = (basePrice, variantValue) => {
  if (!variantValue) {
    return basePrice;
  }

  const multiplier = getVariantMultiplier(variantValue);
  return basePrice * multiplier;
};
