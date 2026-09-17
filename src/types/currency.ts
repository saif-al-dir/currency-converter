/** /latest and /{date} responses */
export interface RatesResponse {
  amount: number;
  base: string;
  date: string;                  // YYYY-MM-DD
  rates: Record<string, number>; // currency code → rate
}

/** /currencies response — code → English name */
export type CurrencyList = Record<string, string>;

/** /{start}..{end} responses, for the chart */
export interface TimeseriesResponse {
  amount: number;
  base: string;
  start_date: string;
  end_date: string;
  rates: Record<string, Record<string, number>>; // date → code → rate
}