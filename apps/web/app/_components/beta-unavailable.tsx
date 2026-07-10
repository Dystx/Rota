import Link from "next/link";
import { Button } from "@repo/ui";
import { PublicRouteLayout } from "./public-route-layout";

export function BetaUnavailable({
  title,
  description,
  returnHref = "/"
}: {
  title: string;
  description: string;
  returnHref?: string;
}) {
  return (
    <PublicRouteLayout>
      <div className="min-h-[calc(100vh-12rem)] flex items-center justify-center px-container-padding-sm py-16">
        <section className="max-w-xl rounded-2xl border border-olive-light/15 bg-white/60 p-8 text-center shadow-raised backdrop-blur-md">
          <p className="font-mono-micro text-mono-micro uppercase tracking-widest text-ochre-dark mb-3">Private beta</p>
          <h1 className="font-headline-lg text-headline-lg text-primary mb-3">{title}</h1>
          <p className="font-body text-body text-on-surface-variant mb-6">{description}</p>
          <Button asChild><Link href={returnHref}>Return to Rumia</Link></Button>
        </section>
      </div>
    </PublicRouteLayout>
  );
}
