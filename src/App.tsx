import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { NotFound } from "./pages/NotFound";

const Currencies = lazy(() =>
  import("./pages/Currencies").then(({ Currencies }) => ({ default: Currencies })),
); // Recharts loads only when this page does

export default function App() {
  const { t } = useTranslation();
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route
              path="currencies"
              element={
                <Suspense fallback={<p className="muted">{t("loading")}</p>}>
                  <Currencies />
                </Suspense>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}