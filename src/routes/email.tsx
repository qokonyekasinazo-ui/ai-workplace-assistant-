import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Mail, Wand2 } from "lucide-react";
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
import { generateEmail, type EmailResult, type EmailTone } from "@/lib/ai.functions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/email")({
  head: () => ({
    meta: [
      { title: "Smart Email Generator — WorkPilot" },
      { name: "description", content: "Turn a few notes into a polished professional email in a formal, friendly or persuasive tone." },
      { property: "og:title", content: "Smart Email Generator — WorkPilot" },
      { property: "og:description", content: "Turn a few notes into a polished professional email." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EmailPage,
});

const TONES: { value: EmailTone; label: string; hint: string }[] = [
  { value: "formal", label: "Formal", hint: "Polished & professional" },
  { value: "friendly", label: "Friendly", hint: "Warm & approachable" },
  { value: "persuasive", label: "Persuasive", hint: "Confident with a CTA" },
];

function EmailPage() {
  const run = useServerFn(generateEmail);
  const [purpose, setPurpose] = useState("");
  const [tone, setTone] = useState<EmailTone>("formal");
  const [recipient, setRecipient] = useState("");
  const [sender, setSender] = useState("");
  const [draft, setDraft] = useState<EmailResult | null>(null);

  const mutation = useMutation({
    mutationFn: () =>
      run({ data: { purpose, tone, recipient: recipient || null, sender: sender || null } }),
    onSuccess: (data) => setDraft(data),
  });

  const canSubmit = purpose.trim().length >= 5 && !mutation.isPending;
  const fullText = draft ? `Subject: ${draft.subject}\n\n${draft.body}` : "";

  return (
    <AppShell>
      <PageHeader
        eyebrow="Smart Email Generator"
        title="Write the email in seconds"
        description="Describe what the email needs to achieve, pick a tone, and get a complete draft you can edit and copy."
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
            <Label htmlFor="purpose">Email purpose & details</Label>
            <Textarea
              id="purpose"
              rows={7}
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="e.g. Ask the finance team to approve the Q4 marketing budget by Friday; mention the 12% projected ROI and that the deck is attached."
              className="resize-y bg-surface"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Tone</Label>
            <div className="grid grid-cols-3 gap-2">
              {TONES.map((t) => (
                <button
                  type="button"
                  key={t.value}
                  onClick={() => setTone(t.value)}
                  aria-pressed={tone === t.value}
                  className={cn(
                    "rounded-lg border px-3 py-2.5 text-left transition-colors",
                    tone === t.value
                      ? "border-primary/60 bg-primary/10 text-foreground glow-ring"
                      : "border-border bg-surface text-muted-foreground hover:border-input hover:text-foreground",
                  )}
                >
                  <div className="text-sm font-semibold">{t.label}</div>
                  <div className="hidden text-[11px] sm:block">{t.hint}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="recipient">Recipient (optional)</Label>
              <Input
                id="recipient"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="e.g. Priya, Head of Finance"
                className="bg-surface"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="sender">Your name (optional)</Label>
              <Input
                id="sender"
                value={sender}
                onChange={(e) => setSender(e.target.value)}
                placeholder="e.g. Sinazo"
                className="bg-surface"
              />
            </div>
          </div>

          <Button type="submit" size="lg" disabled={!canSubmit} className="w-full sm:w-auto">
            <Wand2 /> {mutation.isPending ? "Generating…" : "Generate email"}
          </Button>
        </form>

        <div className="min-w-0">
          {mutation.isPending ? (
            <LoadingState message="Drafting your email…" />
          ) : mutation.isError ? (
            <ErrorState message={mutation.error.message} onRetry={() => mutation.mutate()} />
          ) : draft ? (
            <OutputCard
              title="Your draft"
              actions={<CopyButton getText={() => fullText} label="Copy email" />}
            >
              <EditableField
                label="Subject"
                rows={1}
                value={draft.subject}
                onChange={(subject) => setDraft({ ...draft, subject })}
              />
              <EditableField
                label="Body"
                rows={14}
                value={draft.body}
                onChange={(body) => setDraft({ ...draft, body })}
              />
              <p className="text-xs text-muted-foreground">
                Edit freely — changes stay in this window only and are never saved.
              </p>
            </OutputCard>
          ) : (
            <EmptyState
              icon={<Mail className="size-5" />}
              title="No draft yet"
              description="Fill in the purpose on the left and generate a draft. It will appear here, ready to edit."
            />
          )}
        </div>
      </div>
    </AppShell>
  );
}
