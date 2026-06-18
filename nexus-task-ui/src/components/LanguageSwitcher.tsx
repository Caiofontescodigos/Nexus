import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { setLanguage, getCurrentLanguage } from "@/i18n";
import { Globe } from "lucide-react";

const LANGUAGES = [
  { code: "pt-BR", label: "Português", flag: "🇧🇷" },
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "es", label: "Español", flag: "🇪🇸" },
];

export function LanguageSwitcher() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  const current = getCurrentLanguage();
  const currentLang = LANGUAGES.find((l) => l.code === current) || LANGUAGES[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={menuRef} className="fixed right-4 top-4 z-50">
      <button
        onClick={() => setOpen(!open)}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background shadow-lg transition-all hover:shadow-md hover:scale-105"
        title={t("language.switchTo")}
      >
        <Globe className="h-5 w-5 text-foreground" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-44 overflow-hidden rounded-xl border border-border bg-popover shadow-xl animate-[fade-in_0.15s_ease-out]">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                setLanguage(lang.code);
                setOpen(false);
              }}
              className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-accent ${
                lang.code === current ? "bg-accent font-medium text-accent-foreground" : "text-popover-foreground"
              }`}
            >
              <span className="text-base">{lang.flag}</span>
              <span>{lang.label}</span>
              {lang.code === current && (
                <span className="ml-auto h-2 w-2 rounded-full bg-primary" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
