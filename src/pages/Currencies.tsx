import { useTranslation } from "react-i18next";

export function Currencies() {
  const { t } = useTranslation();
  return (
    <section>
      <h1>{t("navRates")}</h1>
      <p className="muted">{t("loading")}</p>
    </section>
  );
}