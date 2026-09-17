import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { fetchCurrencies } from "../api/frankfurter";

export function Currencies() {
  const { t, i18n } = useTranslation();
  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: ["currencies"],
    queryFn: ({ signal }) => fetchCurrencies(signal),
  });

  if (isPending) return <p>{t("loading")}</p>;
  if (isError)
    return (
      <p>
        {t("error")} ({error.message}){" "}
        <button onClick={() => refetch()}>{t("retry")}</button>
      </p>
    );

  const names = new Intl.DisplayNames([i18n.language], { type: "currency" });
  const codes = Object.keys(data);

  return (
    <section>
      <h1>{t("navRates")}</h1>
      <p>
        {codes.length} —{" "}
        {codes.slice(0, 5).map((c) => `${c} ${names.of(c)}`).join(", ")}…
      </p>
    </section>
  );
}