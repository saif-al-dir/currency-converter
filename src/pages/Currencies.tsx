import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { fetchCurrencies, fetchLatest, fetchTimeseries } from "../api/frankfurter";
import { formatDate } from "../utils/format";

const RANGES = [7, 30, 90, 365];
const DAY_MS = 86_400_000;

function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10); // YYYY-MM-DD; UTC is fine for chart ranges
}

export function Currencies() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === "pl" ? "pl-PL" : "en-US";
  const [searchParams, setSearchParams] = useSearchParams();

  // URL is the single source of truth — and URLs are user input: validate
  const base = searchParams.get("base") ?? "EUR";
  const target = searchParams.get("target") ?? "USD";
  const q = searchParams.get("q") ?? "";
  const rawRange = Number(searchParams.get("range"));
  const range = RANGES.includes(rawRange) ? rawRange : 30;

  const update = (patch: Record<string, string>) => {
    const next = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(patch)) next.set(key, value);
    setSearchParams(next, { replace: true });
  };

  const names = useMemo(
    () => new Intl.DisplayNames([i18n.language], { type: "currency" }),
    [i18n.language]
  );

  const listQuery = useQuery({
    queryKey: ["currencies"],
    queryFn: ({ signal }) => fetchCurrencies(signal),
  });

  const ratesQuery = useQuery({
    queryKey: ["latest", base],
    queryFn: ({ signal }) => fetchLatest(base, undefined, signal),
  });

  const chartQuery = useQuery({
    queryKey: ["timeseries", range, base, target],
    queryFn: ({ signal }) => {
      const end = new Date();
      const start = new Date(end.getTime() - range * DAY_MS);
      return fetchTimeseries(toISODate(start), toISODate(end), base, [target], signal);
    },
    enabled: target !== base,
  });

  const codes = useMemo(
    () => Object.keys(listQuery.data ?? {}).sort(),
    [listQuery.data]
  );

  const rows = useMemo(() => {
    const rates = ratesQuery.data?.rates ?? {};
    const needle = q.trim().toLowerCase();
    return Object.entries(rates)
      .map(([code, rate]) => ({ code, rate, name: names.of(code) ?? code }))
      .filter(
        (r) =>
          needle === "" ||
          r.code.toLowerCase().includes(needle) ||
          r.name.toLowerCase().includes(needle)
      )
      .sort((a, b) => a.code.localeCompare(b.code));
  }, [ratesQuery.data, q, names]);

  const chartData = useMemo(() => {
    const series = chartQuery.data?.rates ?? {};
    return Object.entries(series)
      .map(([date, byCode]) => ({ date, rate: byCode[target] }))
      .filter((p): p is { date: string; rate: number } => typeof p.rate === "number")
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [chartQuery.data, target]);

  return (
    <section>
      <h1>{t("navRates")}</h1>

      <div className="toolbar">
        <label>
          {t("base")}
          <select
            value={base}
            onChange={(e) => update({ base: e.target.value })}
            disabled={listQuery.isPending}
          >
            {codes.map((code) => (
              <option key={code} value={code}>{code} — {names.of(code)}</option>
            ))}
          </select>
        </label>
        <label>
          <span aria-hidden="true">🔎</span>
          <input
            type="search"
            value={q}
            onChange={(e) => update({ q: e.target.value })}
            placeholder={t("filterPlaceholder")}
            aria-label={t("filterPlaceholder")}
          />
        </label>
      </div>

      {target !== base && (
        <div className="chart-card">
          <div className="chart-head">
            <h2>{t("history")}: {base} → {target}</h2>
            <div className="range-btns" role="group" aria-label={t("range")}>
              {RANGES.map((r) => (
                <button
                  key={r}
                  type="button"
                  className={r === range ? "range active" : "range"}
                  onClick={() => update({ range: String(r) })}
                >
                  {t("lastDays", { days: r })}
                </button>
              ))}
            </div>
          </div>

          {chartQuery.isPending ? (
            <div className="skeleton skeleton-line" />
          ) : chartQuery.isError ? (
            <p>
              {t("error")} ({chartQuery.error.message}){" "}
              <button onClick={() => chartQuery.refetch()}>{t("retry")}</button>
            </p>
          ) : chartData.length === 0 ? (
            <p className="muted">{t("noChartData")}</p>
          ) : (
            <div className="chart-wrap">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="rateFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="currentColor" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="currentColor" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#8884" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(d) =>
                      new Date(`${d}T00:00:00`).toLocaleDateString(locale, {
                        month: "short",
                        day: "numeric",
                      })
                    }
                  />
                  <YAxis
                    domain={["auto", "auto"]}
                    width={52}
                    tick={{ fontSize: 12 }}
                    tickFormatter={(v) =>
                      Number(v).toLocaleString(locale, { maximumFractionDigits: 4 })
                    }
                  />
                  <Tooltip
                    labelFormatter={(label) => formatDate(String(label), locale)}
                    formatter={(value) => [
                      Number(value).toLocaleString(locale, { maximumFractionDigits: 4 }),
                      t("rate"),
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="rate"
                    stroke="currentColor"
                    strokeWidth={2}
                    fill="url(#rateFill)"
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {ratesQuery.isPending ? (
        <div className="skeleton skeleton-line" />
      ) : ratesQuery.isError ? (
        <p>
          {t("error")} ({ratesQuery.error.message}){" "}
          <button onClick={() => ratesQuery.refetch()}>{t("retry")}</button>
        </p>
      ) : (
        <>
          <p className="muted">
            {t("ratesHint", { base })} · {t("asOf", { date: formatDate(ratesQuery.data.date, locale) })}
          </p>
          {rows.length === 0 ? (
            <p className="muted">{t("noResults")}</p>
          ) : (
            <table className="rates-table">
              <thead>
                <tr>
                  <th>{t("code")}</th>
                  <th>{t("currency")}</th>
                  <th className="num">{t("rate")}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.code} className={r.code === target ? "selected" : ""}>
                    <td>
                      <button
                        type="button"
                        className="code-btn"
                        title={t("showHistory")}
                        onClick={() => update({ target: r.code })}
                      >
                        {r.code}
                      </button>
                    </td>
                    <td>{r.name}</td>
                    <td className="num">
                      {r.rate.toLocaleString(locale, { maximumFractionDigits: 4 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </section>
  );
}