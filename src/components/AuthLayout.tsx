import type { ReactNode } from "react";
import { Logo } from "@/components/Logo";
import { CheckCircle2, Sparkles, Zap } from "lucide-react";

export function AuthLayout({
  children,
  title,
  subtitle,
}: {
  children: ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="min-h-screen w-full lg:grid lg:grid-cols-2">
      {/* Form side */}
      <div className="flex flex-col px-5 py-6 sm:px-10 lg:px-16">
        <Logo />
        <div className="flex flex-1 items-center justify-center py-8 sm:py-12">
          <div className="w-full max-w-md animate-[slide-up_0.5s_ease-out]">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
            <p className="mt-1.5 text-sm text-muted-foreground sm:mt-2">{subtitle}</p>
            <div className="mt-6 sm:mt-8">{children}</div>
          </div>
        </div>
        <p className="text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Nexus. Sua produtividade em um único lugar.
        </p>
      </div>

      {/* Visual side */}
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-primary via-primary to-primary-glow lg:block">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        </div>
        <div className="relative flex h-full flex-col justify-between p-8 text-primary-foreground xl:p-12">
          <div className="flex items-center gap-2 text-sm font-medium opacity-90">
            <Sparkles className="h-4 w-4" /> Organize. Conecte. Conclua.
          </div>
          <div className="space-y-5 xl:space-y-6">
            <h2 className="text-3xl font-bold leading-tight xl:text-4xl">
              Sua produtividade,
              <br />
              em um único lugar.
            </h2>
            <p className="max-w-md text-sm text-primary-foreground/85 xl:text-base">
              Nexus conecta tarefas, ideias e fluxos em um workspace moderno — pensado para você
              concluir o que realmente importa.
            </p>
            <div className="space-y-3 pt-1 xl:pt-2">
              {[
                { icon: CheckCircle2, text: "Track progress with elegant visualizations" },
                { icon: Zap, text: "Lightning-fast and delightfully responsive" },
                { icon: Sparkles, text: "Light and dark themes built-in" },
              ].map((f) => (
                <div key={f.text} className="flex items-center gap-3 text-sm">
                  <div className="grid h-8 w-8 place-items-center rounded-lg bg-white/15 backdrop-blur">
                    <f.icon className="h-4 w-4" />
                  </div>
                  <span className="opacity-95">{f.text}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="text-xs opacity-70">Trusted by teams who ship.</div>
        </div>
      </div>
    </div>
  );
}
