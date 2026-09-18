import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { CalendarCheck, Wand2, Lightbulb } from "lucide-react";
import { AppShell, PageHeader } from "@/components/AppShell";
import {
  OutputCard,
  CopyButton,
  EditableField,
  LoadingState,
  EmptyState,
  ErrorState,
} from "@/components/ai/AiOutput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { planTasks, type PlanResult } from "@/lib/ai.functions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/tasks")({
  head: () => ({
    meta: [
      { title: "AI Task Planner — WorkPilot" },
      { name: "description", content: "List your tasks, priorities and deadlines and get a prioritized daily or weekly schedule." },
      { property: "og:title", content: "AI Task Planner — WorkPilot" },
      { property: "og:description", content: "A prioritized daily or weekly schedule built from your tasks." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TasksPage,
});

type Horizon = "daily" | "weekly";

type EditableDay = { label: string; focus: string; blocks: string };
type EditablePlan = {
  overview: string;
  prioritized: PlanResult["prioritized"];
  days: EditableDay[];
  tips: string[];
};

function toEditable(p: PlanResult): EditablePlan {
  return {
    overview: p.overview,
    prioritized: p.prioritized,
    tips: p.tips,
    days: p.days.map((d) => ({
      label: d.label,
      focus: d.focus,
      blocks: d.blocks.map((b) => `${b.time}  ${b.task}${b.note ? ` (${b.note})` : ""}`).join("\n"),
    })),
  };
}

function toText(p: EditablePlan) {
  return [
    p.overview,
    "",
    "Priorities",
    ...p.prioritized.map((t) => `• [${t.priority.toUpperCase()}] ${t.task} — ${t.reason}`),
    "",
    ...p.days.flatMap((d) => [`${d.label} — ${d.focus}`, d.blocks, ""]),
    p.tips.length ? "Tips\n" + p.tips.map((t) => `• ${t}`).join("\n") : "",
  ]
    .join("\n")
    .trim();
}

const PRIORITY_STYLE: Record<PlanResult["prioritized"][number]["priority"], string> = {
  critical: "bg-destructive/15 text-destructive border-destructive/30",
  high: "bg-primary/15 text-primary border-primary/30",
  medium: "bg-ai/15 text-ai border-ai/30",
  low: "bg-muted text-muted-foreground border-border",
};

function TasksPage() {
  const run = useServerFn(planTasks);
  const [tasks, setTasks] = useState("");
  const [horizon, setHorizon] = useState<Horizon>("daily");
  const [startDate, setStartDate] = useState("");
  const [workHours, setWorkHours] = useState("");
  const [plan, setPlan] = useState<EditablePlan | null>(null);

  const mutation = useMutation({
    mutationFn: () =>
      run({
        data: {
          tasks,
          horizon,
          startDate: startDate || new Date().toDateString(),
          workHours: workHours || null,
        },
      }),
    onSuccess: (data) => setPlan(toEditable(data)),
  });

  const canSubmit = tasks.trim().length >= 10 && !mutation.isPending;

  const updateDay = (i: number, patch: Partial<EditableDay>) =>
    plan &&
    setPlan({ ...plan, days: plan.days.map((d, idx) => (idx === i ? { ...d, ...patch } : d)) });

  return (
    <AppShell>
      <PageHeader
        eyebrow="AI Task Planner"
        title="Turn your to-do list into a plan"
        description="List your tasks with any priorities and deadlines. The assistant ranks them by urgency and importance and lays out a realistic schedule."
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
        <form
          className="card-surface flex flex-col gap-5 p-5"
          onSubmit={(e) => {
            e.preventDefault();
            if (canSubmit) mutation.mutate();
          }}
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor="tasks">Tasks, priorities & deadlines</Label>
            <Textarea
              id="tasks"
              rows={10}
              value={tasks}
              onChange={(e) => setTasks(e.target.value)}
              placeholder={
                "One task per line, e.g.\n- Finish client proposal (high, due Thursday)\n- Review 3 pull requests (medium)\n- Book flights for conference (low, due end of month)\n- Prep slides for Monday standup (high)"
              }
              className="resize-y bg-surface"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Plan type</Label>
            <div className="grid grid-cols-2 gap-2">
              {(["daily", "weekly"] as Horizon[]).map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => setHorizon(h)}
                  aria-pressed={horizon === h}
                  className={cn(
                    "rounded-lg border px-3 py-2.5 text-sm font-semibold capitalize transition-colors",
                    horizon === h
                      ? "border-primary/60 bg-primary/10 text-foreground glow-ring"
                      : "border-border bg-surface text-muted-foreground hover:text-foreground",
                  )}
                >
                  {h} schedule
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="start">Start date (optional)</Label>
              <Input
                id="start"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-surface"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="hours">Working hours (optional)</Label>
              <Input
                id="hours"
                value={workHours}
                onChange={(e) => setWorkHours(e.target.value)}
                placeholder="09:00 – 17:00"
                className="bg-surface"
              />
            </div>
          </div>

          <Button type="submit" size="lg" disabled={!canSubmit} className="w-full sm:w-auto">
            <Wand2 /> {mutation.isPending ? "Planning…" : "Create schedule"}
          </Button>
        </form>

        <div className="min-w-0">
          {mutation.isPending ? (
            <LoadingState message="Prioritizing tasks and building your schedule…" />
          ) : mutation.isError ? (
            <ErrorState message={mutation.error.message} onRetry={() => mutation.mutate()} />
          ) : plan ? (
            <OutputCard
              title={horizon === "daily" ? "Your day" : "Your week"}
              actions={<CopyButton getText={() => toText(plan)} label="Copy plan" />}
            >
              <EditableField
                label="Overview"
                rows={3}
                value={plan.overview}
                onChange={(overview) => setPlan({ ...plan, overview })}
              />

              <div className="flex flex-col gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Priority ranking
                </span>
                <ol className="flex flex-col gap-2">
                  {plan.prioritized.map((t, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 rounded-lg border border-border bg-surface/60 p-3"
                    >
                      <span
                        className={cn(
                          "mt-0.5 shrink-0 rounded-md border px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                          PRIORITY_STYLE[t.priority],
                        )}
                      >
                        {t.priority}
                      </span>
                      <div className="min-w-0">
                        <div className="text-sm font-medium">{t.task}</div>
                        <div className="text-xs text-muted-foreground">{t.reason}</div>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="flex flex-col gap-3">
                {plan.days.map((d, i) => (
                  <div key={i} className="rounded-lg border border-border bg-surface/60 p-3">
                    <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
                      <input
                        value={d.label}
                        onChange={(e) => updateDay(i, { label: e.target.value })}
                        className="bg-transparent font-display text-sm font-semibold outline-none focus:text-primary"
                        aria-label="Day label"
                      />
                      <input
                        value={d.focus}
                        onChange={(e) => updateDay(i, { focus: e.target.value })}
                        className="min-w-0 flex-1 bg-transparent text-right text-xs text-ai outline-none"
                        aria-label="Day focus"
                      />
                    </div>
                    <EditableField
                      rows={Math.max(3, d.blocks.split("\n").length)}
                      value={d.blocks}
                      onChange={(blocks) => updateDay(i, { blocks })}
                      mono
                    />
                  </div>
                ))}
              </div>

              {plan.tips.length > 0 && (
                <ul className="flex flex-col gap-1.5 rounded-lg border border-primary/20 bg-primary/5 p-3">
                  {plan.tips.map((t, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-foreground/90">
                      <Lightbulb className="mt-0.5 size-3.5 shrink-0 text-primary" /> {t}
                    </li>
                  ))}
                </ul>
              )}
            </OutputCard>
          ) : (
            <EmptyState
              icon={<CalendarCheck className="size-5" />}
              title="No schedule yet"
              description="Add your tasks and choose daily or weekly. Your prioritized schedule will appear here."
            />
          )}
        </div>
      </div>
    </AppShell>
  );
}
