import { ShieldAlert } from "lucide-react";

export function Disclaimer() {
  return (
    <div
      role="note"
      className="flex items-start gap-3 rounded-xl border border-warning/30 bg-warning/10 p-4 text-sm text-foreground/90"
    >
      <ShieldAlert className="mt-0.5 size-4 shrink-0 text-warning" />
      <p>
        AI-generated content may contain errors. Always review and verify outputs before using
        them for important workplace decisions or communications. Do not enter confidential or
        sensitive information.
      </p>
    </div>
  );
}
