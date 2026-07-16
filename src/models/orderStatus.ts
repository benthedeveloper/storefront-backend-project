export const ORDER_STATUSES = ['pending', 'active', 'completed', 'cancelled'] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const isOrderStatus = (value: unknown): value is OrderStatus => {
  return typeof value === 'string' && ORDER_STATUSES.includes(value as OrderStatus);
};
