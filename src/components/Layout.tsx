import { useEffect } from "react";
import { Outlet, NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function Layout() {
  const { t } = useTranslation();

  useEffect(() => {
    document.title = t("appTitle");
  }, [t]);

  return (
    <div className="app">
      <header className="header">
        <NavLink to="/" className="logo">💱 {t("appTitle")}</NavLink>
        <nav className="nav">
          <NavLink to="/" end>{t("navConverter")}</NavLink>
          <NavLink to="/currencies">{t("navRates")}</NavLink>
        </nav>
        <LanguageSwitcher />
      </header>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}