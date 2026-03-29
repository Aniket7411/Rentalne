/**
 * `POST /api/coupons/validate` expects `items[].category`: AC | Refrigerator | Washing Machine
 * (see BACKEND_API_REFERENCE.md).
 */
export function categoryForCouponFromProduct(product) {
  if (!product) return 'AC';
  const c = product.category || product.productType;
  const s = String(c);
  if (s === 'Refrigerator' || s.toLowerCase() === 'refrigerator') return 'Refrigerator';
  if (
    s === 'Washing Machine' ||
    s.toLowerCase() === 'washing machine' ||
    s === 'washing-machine' ||
    s.toLowerCase() === 'washing-machine'
  ) {
    return 'Washing Machine';
  }
  return 'AC';
}
