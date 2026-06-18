import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { AppHeader } from "@/components/AppHeader";
import { TaskCard } from "@/components/TaskCard";
import { TaskModal } from "@/components/TaskModal";
import { EmptyState } from "@/components/EmptyState";
import { useTasks } from "@/contexts/TasksContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Search, ListChecks } from "lucide-react";
import { toast } from "sonner";
import type { Task, TaskStatus } from "@/types";

export const Route = createFileRoute("/_app/tasks")({
  head: () => ({ meta: [{ title: "Tasks — Nexus" }] }),
  component: TasksPage,
});

function TasksPage() {
  const { tasks, loading, addTask, updateTask, deleteTask, toggleComplete } = useTasks();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | TaskStatus>("all");
  const { t } = useTranslation();

  const filtered = useMemo(() => {
    return tasks
      .filter((t) => (filter === "all" ? true : t.status === filter))
      .filter((t) =>
        query ? (t.title + " " + t.description).toLowerCase().includes(query.toLowerCase()) : true,
      );
  }, [tasks, filter, query]);

  const handleSubmit = (data: {
    title: string;
    description: string;
    status: TaskStatus;
    priority: NonNullable<Task["priority"]>;
  }) => {
    if (editing) {
      updateTask(editing.id, data);
      toast.success(t("tasks.taskUpdated"));
    } else {
      addTask(data);
      toast.success(t("tasks.taskCreated"));
    }
    setEditing(null);
  };

  const handleDelete = (id: string) => {
    deleteTask(id);
    toast.success(t("tasks.taskDeleted"));
  };

  return (
    <>
      <AppHeader title={t("tasks.title")} />
      <main className="flex-1 space-y-4 p-4 sm:space-y-5 sm:p-6 lg:p-8 animate-[fade-in_0.4s_ease-out]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-xl font-bold tracking-tight sm:text-2xl">
              {t("tasks.yourTasks")}
            </h2>
            <p className="text-sm text-muted-foreground">
              {tasks.length} {t("tasks.total")} ·{" "}
              {tasks.filter((t) => t.status === "completed").length} {t("tasks.done")}
            </p>
          </div>
          <Button
            onClick={() => {
              setEditing(null);
              setOpen(true);
            }}
            className="shrink-0 w-full sm:w-auto"
          >
            <Plus className="mr-2 h-4 w-4" /> {t("tasks.newTask")}
          </Button>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("tasks.searchPlaceholder")}
              className="pl-10"
            />
          </div>
          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
            <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
              <TabsList className="w-full sm:w-auto">
                <TabsTrigger value="all" className="flex-1 sm:flex-none">
                  {t("tasks.all")}
                </TabsTrigger>
                <TabsTrigger value="pending" className="flex-1 sm:flex-none">
                  {t("tasks.pending")}
                </TabsTrigger>
                <TabsTrigger value="in_progress" className="flex-1 sm:flex-none">
                  {t("tasks.inProgress")}
                </TabsTrigger>
                <TabsTrigger value="completed" className="flex-1 sm:flex-none">
                  {t("tasks.completed")}
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-40 rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={ListChecks}
            title={query || filter !== "all" ? t("tasks.noMatchingTasks") : t("tasks.noTasksYet")}
            description={
              query || filter !== "all" ? t("tasks.noMatchingDesc") : t("tasks.noTasksDesc")
            }
            action={
              !query && filter === "all" ? (
                <Button onClick={() => setOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" /> {t("tasks.createFirst")}
                </Button>
              ) : null
            }
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={(t) => {
                  setEditing(t);
                  setOpen(true);
                }}
                onDelete={handleDelete}
                onToggle={toggleComplete}
              />
            ))}
          </div>
        )}

        <TaskModal
          open={open}
          onOpenChange={(v) => {
            setOpen(v);
            if (!v) setEditing(null);
          }}
          task={editing}
          onSubmit={handleSubmit}
        />
      </main>
    </>
  );
}
