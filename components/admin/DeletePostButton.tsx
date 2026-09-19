"use client";

import { LoaderCircle, Trash2 } from "lucide-react";
import { useState } from "react";
import { useFormStatus } from "react-dom";

export function DeletePostButton({ action, title }: { action: () => Promise<void>; title: string }) {
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        title="Delete post"
        aria-label={`Delete “${title}”`}
        className="grid size-8 place-items-center rounded-lg text-muted transition-colors hover:bg-danger/10 hover:text-danger"
      >
        <Trash2 aria-hidden className="size-4" />
      </button>
    );
  }

  return (
    <form action={action} className="flex items-center gap-1">
      <span className="text-xs text-danger">Delete?</span>
      <ConfirmButton />
      <button
        type="button"
        autoFocus
        onClick={() => setConfirming(false)}
        className="h-8 rounded-lg px-2 text-xs font-semibold text-muted hover:text-fg"
      >
        Cancel
      </button>
    </form>
  );
}

function ConfirmButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex h-8 items-center gap-1 rounded-lg bg-danger/15 px-2.5 text-xs font-bold text-danger hover:bg-danger/25"
    >
      {pending && <LoaderCircle aria-hidden className="size-3.5 animate-spin" />}
      Yes, delete
    </button>
  );
}
