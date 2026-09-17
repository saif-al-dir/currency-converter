import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { fetchCurrencies, fetchLatest, fetchRatesOn } from "../api/frankfurter";
import { formatCurrency, formatDate } from "../utils/format";

export function Home() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === "pl" ? "pl-PL" : "en-US";
  const [searchParams, setSearchParams] = useSearchParams();

  // URL is the single source of truth: ?amount=100&from=EUR&to=PLN
  const amount = searchParams.get("amount") ?? "1";
  const from = searchParams.get("from") ?? "EUR";
  const to = searchParams.get("to") ?? "PLN";

  const amountNum = Number(amount);
  const hasAmount = Number.isFinite(amountNum) && amountNum > 0;
  const sameCurrency = from === to;

  const update = (patch: Record<string, string>) => {
    const next = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(patch)) next.set(key, value);
    setSearchParams(next, { replace: true }); // replace: Back button doesn't replay every keystroke
  };

  const currenciesQuery = useQuery({
    queryKey: ["currencies"],
    queryFn: ({ signal }) => fetchCurrencies(signal),
  });

  const todayISO = new Date().toISOString().slice(0, 10);
  const date = searchParams.get("date") ?? todayISO;
  const isHistorical = date !== todayISO;

  const rateQuery = useQuery({
    queryKey: ["rates", date, from, to],
    queryFn: ({ signal }) =>
      isHistorical
        ? fetchRatesOn(date, from, [to], signal)
        : fetchLatest(from, [to], signal),
    enabled: !sameCurrency,
  });

  const names = useMemo(
    () => new Intl.DisplayNames([i18n.language], { type: "currency" }),
    [i18n.language]
  );
  const codes = useMemo(
    () => Object.keys(currenciesQuery.data ?? {}).sort(),
    [currenciesQuery.data]
  );

  const rate = sameCurrency ? 1 : (rateQuery.data?.rates[to] ?? null);

  return (
    <section>
      <p className="muted">{t("subtitle")}</p>

      {currenciesQuery.isError ? (
        <p>
          {t("error")} ({currenciesQuery.error.message}){" "}
          <button onClick={() => currenciesQuery.refetch()}>{t("retry")}</button>
        </p>
      ) : (
        <form className="converter" onSubmit={(e) => e.preventDefault()}>
          <label>
            {t("amount")}
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="any"
              value={amount}
              onChange={(e) => update({ amount: e.target.value })}
              aria-invalid={!hasAmount}
            />
          </label>
          <label>
            {t("from")}
            <select
              value={from}
              onChange={(e) => update({ from: e.target.value })}
              disabled={currenciesQuery.isPending}
            >
              {codes.map((code) => (
                <option key={code} value={code}>{code} — {names.of(code)}</option>
              ))}
            </select>
          </label>
          <button
            type="button"
            className="swap"
            onClick={() => update({ from: to, to: from })}
            aria-label={t("swap")}
            title={t("swap")}
          >
            ⇄
          </button>
          <label>
            {t("to")}
            <select
              value={to}
              onChange={(e) => update({ to: e.target.value })}
              disabled={currenciesQuery.isPending}
            >
              {codes.map((code) => (
                <option key={code} value={code}>{code} — {names.of(code)}</option>
              ))}
            </select>
          </label>
          <label>
            {t("date")}
            <input
              type="date"
              value={date}
              min="1999-01-04"            // ECB data begins 1999-01-04
              max={todayISO}
              onChange={(e) => update({ date: e.target.value })}
            />
          </label>
        </form>
      )}

      <div className="result">
        {!hasAmount ? (
          <p className="muted">{t("enterAmount")}</p>
        ) : sameCurrency ? (
          <p className="result-value">{formatCurrency(amountNum, to, locale)}</p>
        ) : rateQuery.isPending ? (
          <div className="skeleton skeleton-line" />
        ) : rateQuery.isError ? (
          <p>
            {t("error")} ({rateQuery.error.message}){" "}
            <button onClick={() => rateQuery.refetch()}>{t("retry")}</button>
          </p>
        ) : rate === null ? (
          <p>
            {t("error")} <button onClick={() => rateQuery.refetch()}>{t("retry")}</button>
          </p>
        ) : (
          <>
            <p className="result-value">{formatCurrency(amountNum * rate, to, locale)}</p>
            <p className="muted">
              {t("rateLine", {
                from,
                rate: rate.toLocaleString(locale, { maximumFractionDigits: 4 }),
                to,
              })}
              {" · "}
              {t("asOf", { date: formatDate(rateQuery.data.date, locale) })}
            </p>
          </>
        )}
      </div>
    </section>
  );
}