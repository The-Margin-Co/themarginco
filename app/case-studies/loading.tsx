import { Container } from "@/components/ui/Container";

export default function CaseStudiesLoading() {
  return (
    <Container className="pb-24 pt-14 lg:pt-20" aria-busy="true" aria-label="Loading case studies">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-5">
        <div className="h-6 w-40 animate-pulse rounded-full bg-charcoal" />
        <div className="h-12 w-full max-w-xl animate-pulse rounded-xl bg-charcoal" />
        <div className="h-5 w-full max-w-lg animate-pulse rounded-lg bg-charcoal" />
      </div>
      <div className="mt-16 h-72 animate-pulse rounded-2xl border border-line bg-charcoal" />
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="h-80 animate-pulse rounded-2xl border border-line bg-charcoal" />
        ))}
      </div>
    </Container>
  );
}
