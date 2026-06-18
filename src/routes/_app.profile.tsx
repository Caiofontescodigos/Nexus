import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/AppHeader";
import { UserAvatar } from "@/components/UserAvatar";
import { useAuth } from "@/contexts/AuthContext";
import { useTasks } from "@/contexts/TasksContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Mail,
  User as UserIcon,
  LogOut,
  CheckCircle2,
  Clock,
  ListChecks,
  Flame,
  Pencil,
  Camera,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useState, useRef } from "react";
import { authApi } from "@/services/api";

export const Route = createFileRoute("/_app/profile")({
  head: () => ({ meta: [{ title: "Profile — Nexus" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, logout, updateUser } = useAuth();
  const { tasks } = useTasks();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user) return null;

  const completed = tasks.filter((t) => t.status === "completed").length;
  const pending = tasks.filter((t) => t.status !== "completed").length;
  const rate = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;

  const handleEdit = () => {
    setName(user.name);
    setOpen(true);
  };

  const handleSave = async () => {
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      toast.error("Nome deve ter no mínimo 2 caracteres");
      return;
    }
    if (trimmed.length > 50) {
      toast.error("Nome deve ter no máximo 50 caracteres");
      return;
    }
    setSaving(true);
    try {
      await updateUser({ name: trimmed });
      toast.success("Perfil atualizado com sucesso");
      setOpen(false);
    } catch {
      toast.error("Erro ao atualizar perfil");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 5MB");
      return;
    }
    setUploading(true);
    try {
      await authApi.uploadAvatar(file);
      toast.success("Foto de perfil atualizada");
      window.location.reload();
    } catch {
      toast.error("Erro ao enviar foto. Verifique se o backend suporta upload.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <>
      <AppHeader title={t("profile.title")} />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 animate-[fade-in_0.4s_ease-out]">
        <div className="mx-auto max-w-4xl space-y-5 sm:space-y-6">
          <Card className="overflow-hidden">
            <div className="h-24 bg-gradient-to-br from-primary via-primary-glow to-primary sm:h-32" />
            <CardContent className="-mt-10 p-4 sm:-mt-12 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-end sm:gap-4">
                  <div className="relative group">
                    <UserAvatar
                      user={user}
                      className="h-20 w-20 border-4 border-background shadow-lg sm:h-24 sm:w-24"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <Camera className="h-6 w-6 text-white" />
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                  </div>
                  <div className="text-center sm:text-left sm:pb-2">
                    <h2 className="text-xl font-bold sm:text-2xl">{user.name}</h2>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button onClick={handleEdit} className="w-full sm:w-auto">
                    <Pencil className="mr-2 h-4 w-4" /> Editar Perfil
                  </Button>
                  <Button variant="outline" onClick={logout} className="w-full sm:w-auto">
                    <LogOut className="mr-2 h-4 w-4" /> {t("profile.signOut")}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Editar Perfil</DialogTitle>
                <DialogDescription>Atualize suas informações pessoais</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Nome</Label>
                  <Input
                    id="edit-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome"
                    maxLength={50}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? "Salvando..." : "Salvar"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <div className="grid gap-5 sm:gap-6 sm:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>{t("profile.accountInfo")}</CardTitle>
                <CardDescription>{t("profile.accountDesc")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 rounded-lg border border-border p-3">
                  <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary">
                    <UserIcon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">{t("profile.fullName")}</p>
                    <p className="truncate font-medium">{user.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg border border-border p-3">
                  <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">{t("profile.email")}</p>
                    <p className="truncate font-medium">{user.email}</p>
                  </div>
                </div>
                <Badge variant="secondary" className="gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-success" />{" "}
                  {t("profile.activeAccount")}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("profile.yourStats")}</CardTitle>
                <CardDescription>{t("profile.statsDesc")}</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3">
                {[
                  {
                    icon: ListChecks,
                    label: t("profile.total"),
                    value: tasks.length,
                    color: "text-primary bg-primary/10",
                  },
                  {
                    icon: CheckCircle2,
                    label: t("profile.completed"),
                    value: completed,
                    color: "text-success bg-success/10",
                  },
                  {
                    icon: Clock,
                    label: t("profile.pending"),
                    value: pending,
                    color: "text-warning-foreground bg-warning/15",
                  },
                  {
                    icon: Flame,
                    label: t("profile.completion"),
                    value: `${rate}%`,
                    color: "text-destructive bg-destructive/10",
                  },
                ].map((s) => (
                  <div key={s.label} className="rounded-xl border border-border p-4">
                    <div className={`grid h-9 w-9 place-items-center rounded-lg ${s.color}`}>
                      <s.icon className="h-4 w-4" />
                    </div>
                    <p className="mt-3 text-2xl font-bold">{s.value}</p>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}
