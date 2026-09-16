import { useTranslation } from "react-i18next";

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  return (
    <select
      aria-label="Language"
      value={i18n.language}
      onChange={(e) => {
        i18n.changeLanguage(e.target.value);
        localStorage.setItem("lang", e.target.value);
        document.documentElement.lang = e.target.value;
      }}
    >
      <option value="en">English</option>
      <option value="pl">Polski</option>
    </select>
  );
}