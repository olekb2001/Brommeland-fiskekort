import { site } from "@/config/site";

/** Kjøper du alle kortene en dag (for å fiske alene), er det siste kortet gratis. */
export function isFullDay(qty: number): boolean {
  return qty >= site.cardsPerDay;
}

/** Pris i kroner for én dato med `qty` kort. */
export function linePrice(qty: number): number {
  const paid = isFullDay(qty) ? qty - 1 : qty;
  return paid * site.priceNok;
}

export function orderTotal(lines: { qty: number }[]): number {
  return lines.reduce((sum, l) => sum + linePrice(l.qty), 0);
}
