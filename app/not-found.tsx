import { ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Highlight } from "@/components/ui/Highlight";

export default function NotFound() {
  return (
    <Container className="flex flex-col items-center py-28 text-center sm:py-36">
      <p className="font-display text-7xl font-extrabold tracking-tight text-fg sm:text-8xl">
        4<span className="text-gold">0</span>4
      </p>
      <h1 className="mt-6 text-3xl font-extrabold tracking-tight sm:text-4xl">
        This page left the <Highlight>room</Highlight>.
      </h1>
      <p className="mt-4 max-w-md leading-relaxed">
        The page you&apos;re looking for doesn&apos;t exist or has moved. Let&apos;s get you back to growth.
      </p>
      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <ButtonLink href="/" size="lg">
          Back to home
          <ArrowRight aria-hidden className="size-5" />
        </ButtonLink>
        <ButtonLink href="/blog" variant="secondary" size="lg">
          Read the blog
        </ButtonLink>
      </div>
    </Container>
  );
}
