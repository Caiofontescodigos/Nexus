import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppHeader } from "@/components/AppHeader";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Sun, Moon, Languages, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { setLanguage } from "@/i18n";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/settings")({
  head: () => ({ meta: [{ title: "Settings — Nexus" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const availableLangs = [
    { code: "pt-BR", labelKey: "settings.portuguese" },
    { code: "en", labelKey: "settings.english" },
    { code: "es", labelKey: "settings.spanish" },
  ];

  const handleDelete = () => {
    logout();
    navigate({ to: "/login" });
    toast.error(t("settings.deleteAccount"));
  };

  return (
    <>
      <AppHeader title={t("settings.title")} />
      <main className="flex-1 space-y-5 p-4 sm:space-y-6 sm:p-6 lg:p-8 animate-[fade-in_0.4s_ease-out]">
        <div className="mx-auto max-w-2xl space-y-5 sm:space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("settings.appearance")}</CardTitle>
              <CardDescription>{t("settings.appearanceDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>{t("settings.theme")}</Label>
                <p className="text-sm text-muted-foreground">{t("settings.themeDesc")}</p>
                <RadioGroup
                  value={theme}
                  onValueChange={(v) => setTheme(v as "light" | "dark")}
                  className="flex flex-col gap-3 sm:flex-row"
                >
                  <Label
                    htmlFor="light"
                    className={`flex flex-1 cursor-pointer items-center gap-3 rounded-lg border p-4 transition hover:bg-accent ${theme === "light" ? "border-primary" : ""}`}
                  >
                    <RadioGroupItem value="light" id="light" />
                    <Sun className="h-5 w-5" />
                    <span className="font-medium">{t("settings.light")}</span>
                  </Label>
                  <Label
                    htmlFor="dark"
                    className={`flex flex-1 cursor-pointer items-center gap-3 rounded-lg border p-4 transition hover:bg-accent ${theme === "dark" ? "border-primary" : ""}`}
                  >
                    <RadioGroupItem value="dark" id="dark" />
                    <Moon className="h-5 w-5" />
                    <span className="font-medium">{t("settings.dark")}</span>
                  </Label>
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <Label>{t("settings.language")}</Label>
                <p className="text-sm text-muted-foreground">{t("settings.languageDesc")}</p>
                <RadioGroup
                  value={i18n.language}
                  onValueChange={setLanguage}
                  className="flex flex-col gap-3 sm:flex-row"
                >
                  {availableLangs.map((lang) => (
                    <Label
                      key={lang.code}
                      htmlFor={lang.code}
                      className={`flex flex-1 cursor-pointer items-center gap-3 rounded-lg border p-4 transition hover:bg-accent ${i18n.language === lang.code ? "border-primary" : ""}`}
                    >
                      <RadioGroupItem value={lang.code} id={lang.code} />
                      <Languages className="h-5 w-5" />
                      <span className="font-medium">{t(lang.labelKey)}</span>
                    </Label>
                  ))}
                </RadioGroup>
              </div>
            </CardContent>
          </Card>

          <Card className="border-destructive/30">
            <CardHeader>
              <CardTitle className="text-destructive">{t("settings.dangerZone")}</CardTitle>
              <CardDescription>{t("settings.dangerDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="mr-2 h-4 w-4" /> {t("settings.deleteAccount")}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t("settings.deleteAccount")}</AlertDialogTitle>
                    <AlertDialogDescription>{t("settings.deleteConfirm")}</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{t("settings.cancel")}</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-destructive text-destructive-foreground"
                    >
                      {t("settings.confirm")}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
