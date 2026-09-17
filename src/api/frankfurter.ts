import type { CurrencyList, RatesResponse, TimeseriesResponse } from "../types/currency";

const BASE = "https://api.frankfurter.dev/v1";

async function get<T>(url: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(url, { signal });
  if (!res.ok) {
    let message = `API error ${res.status}`;
    try {
      const body = (await res.json()) as { message?: string };
      if (body.message) message = body.message;
    } catch {
      // keep the generic message if the body isn't JSON
    }
    throw new Error(message);
  }
  return res.json() as Promise<T>;
}

function qs(base: string, symbols?: string[]): string {
  const params = new URLSearchParams({ base });
  if (symbols?.length) params.set("symbols", symbols.join(","));
  return params.toString();
}

/** Today's (or last business day's) rates for `base` — all currencies if symbols omitted */
export function fetchLatest(base: string, symbols?: string[], signal?: AbortSignal) {
  return get<RatesResponse>(`${BASE}/latest?${qs(base, symbols)}`, signal);
}

/** Rates as they were on a given date (YYYY-MM-DD) */
export function fetchRatesOn(date: string, base: string, symbols?: string[], signal?: AbortSignal) {
  return get<RatesResponse>(`${BASE}/${date}?${qs(base, symbols)}`, signal);
}

/** Daily rates between two dates (inclusive) — powers the M4 chart */
export function fetchTimeseries(
  start: string,
  end: string,
  base: string,
  symbols: string[],
  signal?: AbortSignal
) {
  return get<TimeseriesResponse>(`${BASE}/${start}..${end}?${qs(base, symbols)}`, signal);
}

/** Supported currencies (~30, ECB reference set) */
export function fetchCurrencies(signal?: AbortSignal) {
  return get<CurrencyList>(`${BASE}/currencies`, signal);
}