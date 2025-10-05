export function unitPriceFor(it: {
  price: number;
  qty: number;
  promoFirstPrice?: number;
  priceAfterFirst?: number;
}) {
  if (it.promoFirstPrice != null)
    return it.qty <= 1 ? it.promoFirstPrice : it.priceAfterFirst ?? it.price;
  return it.price;
}
export function lineTotalFor(it: {
  price: number;
  qty: number;
  promoFirstPrice?: number;
  priceAfterFirst?: number;
}) {
  if (it.promoFirstPrice != null) {
    const first = it.promoFirstPrice;
    const restPrice = it.priceAfterFirst ?? it.price;
    const restQty = Math.max(0, it.qty - 1);
    return first + restQty * restPrice;
  }
  return it.price * it.qty;
}
