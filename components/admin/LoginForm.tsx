"use client";

import { LoaderCircle, LogIn } from "lucide-react";
import { useActionState } from "react";
import { signIn } from "@/app/admin/login/actions";
import { Button } from "@/components/ui/Button";
import { FormBanner, FormField, inputStyles } from "@/components/ui/FormField";
import type { FormState } from "@/lib/validation";

const INITIAL_STATE: FormState = { status: "idle" };

export function LoginForm({ next, disabled }: { next: string; disabled: boolean }) {
  const [state, formAction, pending] = useActionState(signIn, INITIAL_STATE);

  return (
    <form action={formAction} className="space-y-5">
      {state.status === "error" && state.message && <FormBanner tone="error">{state.message}</FormBanner>}
      <input type="hidden" name="next" value={next} />

      <FormField id="admin-email" label="Email" required>
        <input
          id="admin-email"
          name="email"
          type="email"
          autoComplete="username"
          required
          disabled={disabled}
          className={inputStyles()}
        />
      </FormField>

      <FormField id="admin-password" label="Password" required>
        <input
          id="admin-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          disabled={disabled}
          className={inputStyles()}
        />
      </FormField>

      <Button type="submit" size="lg" disabled={pending || disabled} className="w-full">
        {pending ? (
          <LoaderCircle aria-hidden className="size-5 animate-spin" />
        ) : (
          <LogIn aria-hidden className="size-5" />
        )}
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
