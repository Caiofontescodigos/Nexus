import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { AppHeader } from "@/components/AppHeader";
import { StatCard } from "@/components/StatCard";
import { useTasks } from "@/contexts/TasksContext";
import { useAuth } from "@/contexts/AuthContext";
import { ListChecks, CheckCircle2, Clock, TrendingUp, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Area, AreaChart } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Nexus" }] }),
  component: DashboardPage,
});

function DashboardPage() {
  const { tasks, loading } = useTasks();
  const { user } = useAuth();
  const { t } = useTranslation();

  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === "completed").length;
  const pending = tasks.filter((t) => t.status !== "completed").length;
  const rate = total ? Math.round((completed / total) * 100) : 0;

  const weeklyData = useMemo(() => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const today = new Date().getDay();
    const result = days.map((day) => ({ day, completed: 0, created: 0 }));

    tasks.forEach((task) => {
      const date = new Date(task.createdAt);
      const dayIndex = date.getDay();
      const diff = (today - dayIndex + 7) % 7;
      if (diff < 7) {
        result[dayIndex].created++;
        if (task.status === "completed") {
          result[dayIndex].completed++;
        }
      }
    });

    return result;
  }, [tasks]);

  const trendData = useMemo(() => {
    const weeks = tasks.reduce(
      (
        acc: Record<string, { week: string; score: number; total: number; completed: number }>,
        task,
      ) => {
        const date = new Date(task.createdAt);
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        const key = weekStart.toISOString().slice(0, 10);
        if (!acc[key]) {
          acc[key] = { week: `W${Object.keys(acc).length + 1}`, score: 0, total: 0, completed: 0 };
        }
        acc[key].total++;
        if (task.status === "completed") acc[key].completed++;
        return acc;
      },
      {},
    );

    return Object.values(weeks)
      .map((w) => ({ ...w, score: w.total ? Math.round((w.completed / w.total) * 100) : 0 }))
      .slice(-6);
  }, [tasks]);

  return (
    <>
      <AppHeader title={t("dashboard.title")} />
      <main className="flex-1 space-y-5 p-4 sm:space-y-6 sm:p-6 lg:p-8 animate-[fade-in_0.4s_ease-out]">
        <div>
          <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
            {t("dashboard.welcome", { name: user?.name?.split(" ")[0] })}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("dashboard.subtitle")}</p>
        </div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label={t("dashboard.totalTasks")}
              value={total}
              icon={ListChecks}
              accent="primary"
              hint={t("dashboard.allTasksInWorkspace")}
            />
            <StatCard
              label={t("dashboard.completed")}
              value={completed}
              icon={CheckCircle2}
              accent="success"
              hint={t("dashboard.greatWork")}
            />
            <StatCard
              label={t("dashboard.pending")}
              value={pending}
              icon={Clock}
              accent="warning"
              hint={t("dashboard.stillToDo")}
            />
            <StatCard
              label={t("dashboard.completionRate")}
              value={`${rate}%`}
              icon={TrendingUp}
              accent="primary"
              hint={t("dashboard.ofAllTasks")}
            />
          </div>
        )}

        <div className="grid gap-5 lg:gap-6 lg:grid-cols-5">
          <Card className="overflow-x-auto lg:col-span-3">
            <CardHeader>
              <CardTitle>{t("dashboard.weeklyActivity")}</CardTitle>
              <CardDescription>{t("dashboard.weeklyDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  completed: { label: t("dashboard.completed"), color: "var(--color-chart-2)" },
                  created: { label: "Created", color: "var(--color-chart-1)" },
                }}
                className="h-[280px] w-full"
              >
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} className="text-xs" />
                  <YAxis tickLine={false} axisLine={false} className="text-xs" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="created" fill="var(--color-created)" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="completed" fill="var(--color-completed)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="overflow-x-auto lg:col-span-2">
            <CardHeader>
              <CardTitle>{t("dashboard.productivityTrend")}</CardTitle>
              <CardDescription>{t("dashboard.productivityDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              {trendData.length > 0 ? (
                <ChartContainer
                  config={{ score: { label: "Score", color: "var(--color-chart-1)" } }}
                  className="h-[280px] w-full"
                >
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--color-score)" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="var(--color-score)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      className="stroke-border"
                    />
                    <XAxis dataKey="week" tickLine={false} axisLine={false} className="text-xs" />
                    <YAxis tickLine={false} axisLine={false} className="text-xs" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area
                      type="monotone"
                      dataKey="score"
                      stroke="var(--color-score)"
                      strokeWidth={2.5}
                      fill="url(#scoreGrad)"
                    />
                  </AreaChart>
                </ChartContainer>
              ) : (
                <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
                  {t("dashboard.emptyTrend")}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="flex flex-wrap items-center justify-between gap-3 p-5">
            <div>
              <p className="font-semibold">{t("dashboard.readyToPlan")}</p>
              <p className="text-sm text-muted-foreground">{t("dashboard.planDesc")}</p>
            </div>
            <Button asChild>
              <Link to="/tasks">
                {t("dashboard.goToTasks")} <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
