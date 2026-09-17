import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export function NotFound() {
  const { t } = useTranslation();
  return (
    <section>
      <h1>404</h1>
      <p>{t("notFound")}</p>
      <Link to="/">← {t("backHome")}</Link>
    </section>
  );
}