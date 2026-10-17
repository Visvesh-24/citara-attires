import { SweepLink } from "@/components/ui/Buttons";

export default function NotFound() {
  return (
    <div className="container-x flex min-h-[80svh] flex-col items-center justify-center pt-28 text-center">
      <p className="eyebrow text-gold-700">404</p>
      <h1 className="mt-4 font-display text-6xl font-light text-emerald-900">
        This page has <span className="text-gold-600 italic">wandered off.</span>
      </h1>
      <p className="mt-4 text-muted">Let&apos;s get you back to something beautiful.</p>
      <div className="mt-10">
        <SweepLink href="/shop" variant="dark">
          Browse the collection
        </SweepLink>
      </div>
    </div>
  );
}
