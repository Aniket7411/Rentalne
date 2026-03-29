export function generateOrderId() {
  const y = new Date().getFullYear();
  const n = Math.floor(Math.random() * 900000) + 100000;
  return `ORD-${y}-${n}`;
}

export function roundMoney(value) {
  const n = Number(value);
  if (Number.isNaN(n)) return 0;
  return Math.round((n + Number.EPSILON) * 100) / 100;
}
