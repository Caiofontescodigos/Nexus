import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./en.json";
import ptBR from "./pt-BR.json";
import es from "./es.json";

const LANG_KEY = "nexus-lang";

const savedLang = typeof window !== "undefined" ? localStorage.getItem(LANG_KEY) : null;

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    "pt-BR": { translation: ptBR },
    es: { translation: es },
  },
  lng: savedLang || "pt-BR",
  fallbackLng: "pt-BR",
  interpolation: { escapeValue: false },
});

export function setLanguage(lang: string) {
  localStorage.setItem(LANG_KEY, lang);
  void i18n.changeLanguage(lang);
}

export function getCurrentLanguage(): string {
  return i18n.language;
}

export default i18n;
