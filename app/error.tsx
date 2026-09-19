"use client";

import { RotateCcw } from "lucide-react";
import { useEffect } from "react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Container className="flex flex-col items-center py-28 text-center sm:py-36">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">Something went wrong</p>
      <h1 className="mt-5 text-3xl font-extrabold tracking-tight sm:text-4xl">
        We hit an unexpected snag.
      </h1>
      <p className="mt-4 max-w-md leading-relaxed">
        Please try again. If the problem persists, reach out and we&apos;ll sort it out.
      </p>
      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <Button size="lg" onClick={() => retry()}>
          <RotateCcw aria-hidden className="size-5" />
          Try again
        </Button>
        <ButtonLink href="/" variant="secondary" size="lg">
          Back to home
        </ButtonLink>
      </div>
    </Container>
  );
}
