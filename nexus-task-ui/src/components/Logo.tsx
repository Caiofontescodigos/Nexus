import { Hexagon } from "lucide-react";

export function Logo({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary to-primary-glow shadow-[var(--shadow-elegant)]">
        <Hexagon className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
        <span className="absolute h-1.5 w-1.5 rounded-full bg-primary-foreground" />
      </div>
      {!collapsed && (
        <span className="text-lg font-bold tracking-tight text-foreground">
          Nex<span className="text-primary">us</span>
        </span>
      )}
    </div>
  );
}
