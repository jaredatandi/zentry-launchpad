export const LAUNCH_PAGE_PRICES = {
  USD: 79,
  KES: 2500,
} as const;

export type Currency = keyof typeof LAUNCH_PAGE_PRICES;

export function isCurrency(value: string): value is Currency {
  return value === "USD" || value === "KES";
}

export function priceFor(currency: Currency): number {
  return LAUNCH_PAGE_PRICES[currency];
}
