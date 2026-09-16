import { useTranslation } from "react-i18next";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { LanguageSwitcher } from "./components/LanguageSwitcher";

export default function App() {
  const { t } = useTranslation();
  return (
    <ErrorBoundary>
      <main className="app" style={{ padding: "2rem" }}>
        <LanguageSwitcher />
        <h1>💱 {t("appTitle")}</h1>
        <p>{t("subtitle")}</p>
      </main>
    </ErrorBoundary>
  );
}