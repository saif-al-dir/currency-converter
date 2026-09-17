import { useTranslation } from "react-i18next";

export function Home() {
  const { t } = useTranslation();
  return (
    <section>
      <p className="muted">{t("subtitle")}</p>
    </section>
  );
}