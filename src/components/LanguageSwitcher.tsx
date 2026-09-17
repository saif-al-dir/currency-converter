// src/components/LanguageSwitcher.tsx — full replacement
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

const LANGS = [
  { code: "en", flag: "gb", label: "English" },
  { code: "pl", flag: "pl", label: "Polski" },
];

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const current = i18n.language.slice(0, 2); // normalize "en-US" → "en"

  useEffect(() => {
    const lang = i18n.language.slice(0, 2);
    document.documentElement.lang = lang;
    localStorage.setItem("lang", lang);
  }, [i18n.language]);

  const set = (code: string) => {
    i18n.changeLanguage(code);
  };

  return (
    <div className="lang-switcher" role="group" aria-label="Language / Język">
      {LANGS.map(({ code, flag, label }) => (
        <button
          key={code}
          type="button"
          className={current === code ? "lang active" : "lang"}
          onClick={() => set(code)}
          aria-label={label}
          aria-pressed={current === code}
          title={label}
        >
          <img src={`https://flagcdn.com/w40/${flag}.png`} width={22} height={15} alt="" />
          <span>{code.toUpperCase()}</span>
        </button>
      ))}
    </div>
  );
}