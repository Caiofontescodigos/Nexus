import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Pencil, Trash2, Calendar } from "lucide-react";
import type { Task } from "@/types";

interface Props {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
}

const statusStyles: Record<Task["status"], string> = {
  pending: "bg-warning/15 text-warning-foreground border-warning/30",
  in_progress: "bg-primary/10 text-primary border-primary/30",
  completed: "bg-success/15 text-success border-success/30",
};
const statusLabel: Record<Task["status"], string> = {
  pending: "Pending",
  in_progress: "In Progress",
  completed: "Completed",
};
const priorityStyles: Record<NonNullable<Task["priority"]>, string> = {
  low: "text-muted-foreground",
  medium: "text-primary",
  high: "text-destructive",
};

export function TaskCard({ task, onEdit, onDelete, onToggle }: Props) {
  const completed = task.status === "completed";
  const date = new Date(task.createdAt).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Card className="group overflow-hidden border-border/60 transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-elegant)] animate-[fade-in_0.3s_ease-out]">
      <CardContent className="p-5">
        <div className="flex items-start gap-3">
          <Checkbox
            checked={completed}
            onCheckedChange={() => onToggle(task.id)}
            className="mt-1 shrink-0"
            aria-label="Mark as complete"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <h3
                className={`truncate text-base font-semibold ${
                  completed ? "text-muted-foreground line-through" : "text-foreground"
                }`}
              >
                {task.title}
              </h3>
              <Badge variant="outline" className={`shrink-0 ${statusStyles[task.status]}`}>
                {statusLabel[task.status]}
              </Badge>
            </div>
            <p className={`mt-1.5 line-clamp-2 text-sm ${completed ? "text-muted-foreground/70" : "text-muted-foreground"}`}>
              {task.description}
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  {date}
                </span>
                {task.priority && (
                  <span className={`font-medium capitalize ${priorityStyles[task.priority]}`}>
                    ● {task.priority}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 opacity-70 transition-opacity group-hover:opacity-100">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(task)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete this task?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. The task "{task.title}" will be permanently removed.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => onDelete(task.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
