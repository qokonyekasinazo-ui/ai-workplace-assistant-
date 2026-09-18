import { useState, type ReactNode } from "react";
import { Check, Copy, Sparkles, AlertCircle, Loader2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export function AiBadge() {
  return (
    <span className="ai-chip">
      <Sparkles className="size-3" />
      AI generated
    </span>
  );
}

export function CopyButton({ getText, label = "Copy" }: { getText: () => string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(getText());
          setCopied(true);
          setTimeout(() => setCopied(false), 1600);
        } catch {
          /* clipboard unavailable */
        }
      }}
    >
      {copied ? <Check className="text-success" /> : <Copy />}
      {copied ? "Copied" : label}
    </Button>
  );
}

export function OutputCard({
  title,
  actions,
  children,
  className,
}: {
  title: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("card-surface flex flex-col", className)}>
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-5 py-3">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-semibold">{title}</h2>
          <AiBadge />
        </div>
        <div className="flex items-center gap-2">{actions}</div>
      </header>
      <div className="flex flex-col gap-4 p-5">{children}</div>
    </section>
  );
}

export function EditableField({
  label,
  value,
  onChange,
  rows = 4,
  mono,
}: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  mono?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      {label && (
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
      )}
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className={cn(
          "resize-y bg-surface text-sm leading-relaxed focus-visible:ring-primary",
          mono && "font-mono text-xs",
        )}
      />
    </label>
  );
}

export function LoadingState({ message }: { message: string }) {
  return (
    <div className="card-surface flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <span className="relative flex size-12 items-center justify-center rounded-full bg-ai/10 text-ai">
        <Loader2 className="size-5 animate-spin" />
        <span className="absolute inset-0 animate-ping rounded-full bg-ai/10" />
      </span>
      <p className="text-sm font-medium">{message}</p>
      <p className="text-xs text-muted-foreground">This usually takes a few seconds.</p>
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="card-surface flex flex-col items-center justify-center gap-3 border-dashed px-6 py-16 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        {icon}
      </span>
      <p className="text-sm font-medium">{title}</p>
      <p className="max-w-xs text-xs text-muted-foreground">{description}</p>
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div
      role="alert"
      className="card-surface flex flex-col items-center justify-center gap-3 border-destructive/40 px-6 py-12 text-center"
    >
      <span className="flex size-12 items-center justify-center rounded-full bg-destructive/15 text-destructive">
        <AlertCircle className="size-5" />
      </span>
      <p className="text-sm font-medium">Something went wrong</p>
      <p className="max-w-sm text-xs text-muted-foreground">{message}</p>
      {onRetry && (
        <Button type="button" variant="outline" size="sm" onClick={onRetry}>
          <RotateCcw /> Try again
        </Button>
      )}
    </div>
  );
}
