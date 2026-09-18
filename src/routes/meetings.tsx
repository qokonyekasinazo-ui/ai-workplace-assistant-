import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { FileText, Wand2, ListChecks, Gavel, CalendarClock, Users } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { summarizeMeeting, type MeetingResult } from "@/lib/ai.functions";

export const Route = createFileRoute("/meetings")({
  head: () => ({
    meta: [
      { title: "Meeting Notes Summarizer — WorkPilot" },
      { name: "description", content: "Paste raw meeting notes and get a concise summary with action items, decisions, owners and deadlines." },
      { property: "og:title", content: "Meeting Notes Summarizer — WorkPilot" },
      { property: "og:description", content: "Concise summaries with action items, decisions and deadlines." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MeetingsPage,
});

/** Editable, text-based view of the structured result. */
type Editable = {
  title: string;
  summary: string;
  actionItems: string;
  decisions: string;
  deadlines: string;
  participants: string;
};

function toEditable(r: MeetingResult): Editable {
  return {
    title: r.title,
    summary: r.summary,
    actionItems: r.actionItems
      .map((a) => {
        const meta = [a.owner && `Owner: ${a.owner}`, a.deadline && `Due: ${a.deadline}`]
          .filter(Boolean)
          .join(" · ");
        return `• ${a.task}${meta ? ` — ${meta}` : ""}`;
      })
      .join("\n"),
    decisions: r.decisions.map((d) => `• ${d}`).join("\n"),
    deadlines: r.deadlines.map((d) => `• ${d.item} — ${d.date}`).join("\n"),
    participants: r.participants.join(", "),
  };
}

function toText(e: Editable) {
  const section = (h: string, body: string) => (body.trim() ? `${h}\n${body}\n\n` : "");
  return (
    `${e.title}\n\n${e.summary}\n\n` +
    section("Action items", e.actionItems) +
    section("Decisions", e.decisions) +
    section("Deadlines", e.deadlines) +
    section("Participants", e.participants)
  ).trim();
}

function MeetingsPage() {
  const run = useServerFn(summarizeMeeting);
  const [notes, setNotes] = useState("");
  const [result, setResult] = useState<Editable | null>(null);

  const mutation = useMutation({
    mutationFn: () => run({ data: { notes } }),
    onSuccess: (data) => setResult(toEditable(data)),
  });

  const canSubmit = notes.trim().length >= 20 && !mutation.isPending;
  const set = (k: keyof Editable) => (v: string) => result && setResult({ ...result, [k]: v });

  return (
    <AppShell>
      <PageHeader
        eyebrow="Meeting Notes Summarizer"
        title="From messy notes to clear outcomes"
        description="Paste your raw notes or transcript. The assistant summarizes the discussion and pulls out action items, decisions, owners and deadlines."
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
            <div className="flex items-center justify-between">
              <Label htmlFor="notes">Meeting notes</Label>
              <span className="text-xs text-muted-foreground">{notes.length.toLocaleString()} chars</span>
            </div>
            <Textarea
              id="notes"
              rows={16}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Paste the full notes or transcript here. Include who said what, any decisions, and dates if you have them."
              className="resize-y bg-surface"
            />
            <p className="text-xs text-muted-foreground">
              Remove names or details you would not share outside the team.
            </p>
          </div>
          <Button type="submit" size="lg" disabled={!canSubmit} className="w-full sm:w-auto">
            <Wand2 /> {mutation.isPending ? "Summarizing…" : "Summarize notes"}
          </Button>
        </form>

        <div className="min-w-0">
          {mutation.isPending ? (
            <LoadingState message="Reading your notes and extracting outcomes…" />
          ) : mutation.isError ? (
            <ErrorState message={mutation.error.message} onRetry={() => mutation.mutate()} />
          ) : result ? (
            <OutputCard
              title="Meeting summary"
              actions={<CopyButton getText={() => toText(result)} label="Copy all" />}
            >
              <EditableField label="Title" rows={1} value={result.title} onChange={set("title")} />
              <EditableField label="Summary" rows={5} value={result.summary} onChange={set("summary")} />

              <div className="grid gap-4 md:grid-cols-2">
                <Section icon={<ListChecks className="size-3.5" />} label="Action items" value={result.actionItems} onChange={set("actionItems")} empty="No action items were identified." />
                <Section icon={<Gavel className="size-3.5" />} label="Decisions" value={result.decisions} onChange={set("decisions")} empty="No explicit decisions found." />
                <Section icon={<CalendarClock className="size-3.5" />} label="Deadlines" value={result.deadlines} onChange={set("deadlines")} empty="No deadlines mentioned." />
                <Section icon={<Users className="size-3.5" />} label="Responsible persons" value={result.participants} onChange={set("participants")} empty="No people named." />
              </div>
            </OutputCard>
          ) : (
            <EmptyState
              icon={<FileText className="size-5" />}
              title="No summary yet"
              description="Paste your notes and click Summarize. The summary and extracted items will show here."
            />
          )}
        </div>
      </div>
    </AppShell>
  );
}

function Section({
  icon,
  label,
  value,
  onChange,
  empty,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  onChange: (v: string) => void;
  empty: string;
}) {
  return (
    <div className="flex flex-col gap-1.5 rounded-lg border border-border bg-surface/60 p-3">
      <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-ai">
        {icon} {label}
      </span>
      {value.trim() ? (
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
          className="resize-y border-0 bg-transparent px-0 text-sm leading-relaxed shadow-none focus-visible:ring-0"
        />
      ) : (
        <p className="text-xs italic text-muted-foreground">{empty}</p>
      )}
    </div>
  );
}
