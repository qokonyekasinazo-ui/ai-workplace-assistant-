import { createFileRoute, Link } from "@tanstack/react-router";
import { Mail, FileText, CalendarCheck, ArrowRight, Sparkles, Lock, Zap, Eye } from "lucide-react";
import { AppShell, PageHeader } from "@/components/AppShell";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "WorkPilot — AI Workplace Productivity Assistant" },
      {
        name: "description",
        content:
          "Draft professional emails, summarize meeting notes and plan your tasks with AI — a lightweight workplace assistant with nothing stored.",
      },
      { property: "og:title", content: "WorkPilot — AI Workplace Productivity Assistant" },
      { property: "og:description", content: "Draft emails, summarize meetings and plan your week with AI." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

const TOOLS = [
  {
    to: "/email",
    icon: Mail,
    title: "Smart Email Generator",
    description: "Describe the goal, choose formal, friendly or persuasive, and get a ready-to-send draft.",
    cta: "Draft an email",
  },
  {
    to: "/meetings",
    icon: FileText,
    title: "Meeting Notes Summarizer",
    description: "Paste raw notes to get a tight summary plus action items, decisions, owners and deadlines.",
    cta: "Summarize notes",
  },
  {
    to: "/tasks",
    icon: CalendarCheck,
    title: "AI Task Planner",
    description: "List tasks and deadlines; get a prioritized daily or weekly schedule you can tweak.",
    cta: "Plan my tasks",
  },
] as const;

const PRINCIPLES = [
  { icon: Zap, title: "Generated on demand", text: "Every output is produced live from what you type — no canned templates." },
  { icon: Lock, title: "Nothing is stored", text: "No accounts, no database. Close the tab and your inputs are gone." },
  { icon: Eye, title: "You stay in control", text: "Every result is editable and clearly marked as AI-generated." },
];

function Dashboard() {
  return (
    <AppShell>
      <section className="card-surface relative overflow-hidden p-6 sm:p-10">
        <div className="absolute -right-16 -top-16 size-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-20 left-1/3 size-64 rounded-full bg-ai/10 blur-3xl" />
        <div className="relative max-w-2xl">
          <span className="ai-chip">
            <Sparkles className="size-3" /> AI-powered workspace
          </span>
          <h1 className="mt-4 text-3xl font-semibold sm:text-4xl lg:text-5xl">
            Get the busywork done
            <span className="text-primary"> before your coffee cools.</span>
          </h1>
          <p className="mt-4 text-sm text-muted-foreground sm:text-base">
            WorkPilot drafts your emails, distils your meetings and organises your day — all
            generated live from your own words.
          </p>
        </div>
      </section>

      <PageHeader title="Tools" description="Pick a tool to get started." />
      <div className="grid gap-4 md:grid-cols-3">
        {TOOLS.map(({ to, icon: Icon, title, description, cta }) => (
          <Link
            key={to}
            to={to}
            className="card-surface group flex flex-col gap-4 p-5 transition-all hover:-translate-y-0.5 hover:border-primary/40"
          >
            <span className="flex size-10 items-center justify-center rounded-lg bg-primary/12 text-primary">
              <Icon className="size-5" />
            </span>
            <div className="flex-1">
              <h3 className="text-base font-semibold">{title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
            </div>
            <span className="flex items-center gap-1.5 text-sm font-semibold text-primary">
              {cta}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {PRINCIPLES.map(({ icon: Icon, title, text }) => (
          <div key={title} className="flex gap-3 rounded-xl border border-border bg-surface/60 p-4">
            <Icon className="mt-0.5 size-4 shrink-0 text-ai" />
            <div>
              <div className="text-sm font-semibold">{title}</div>
              <p className="mt-1 text-xs text-muted-foreground">{text}</p>
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
