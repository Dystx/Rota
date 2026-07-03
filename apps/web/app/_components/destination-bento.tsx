import Link from "next/link";

/**
 * DestinationBento — editorial bento grid for /portugal regions.
 *
 * Source: docs/prototype.html (Discovery Bento Grid).
 * 12-column grid, 3 cards:
 *   - Lisbon & Surrounds (8-col, 2-row) — Capital Region
 *   - Douro Valley (4-col, 2-row) — Wine Country
 *   - The Azores (12-col, 1-row) — Island Archipelago
 */
export function DestinationBento() {
  return (
    <section className="max-w-7xl mx-auto px-container-padding-lg py-section-gap relative -mt-32 z-20">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter auto-rows-[250px]">
        {/* Bento Item 1: Lisbon (Large) */}
        <Link
          href="/portugal"
          className="md:col-span-8 row-span-2 group relative rounded-xl overflow-hidden shadow-lg border border-white/40 block"
        >
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
            style={{
              backgroundImage:
                "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBvuwR3iBxSI7Dc_xUue9PlZOCxIkQdO1BKnkgj-Vq6a6JbMPr5O97KI6d0ZWxwqjhuR1vs8JPyayESizGC4kuFSrWW58tlR9jga482rLrmo0T-b4VypQQsJAaei9FZ1yDMY7XIWocnoL1SV_GZQdCU56_yCUHMLkWvsUCY0wotaS3KlSHTP951qa-BSLMipuZqD84KyB7aj3cjePoP6zdoo9Mwo3l7tSNZjLrmkXopRfAh8ZnUeya-lMseIAzgR9e4PQ6wJjrQCdf7')",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-olive-dark/80 via-olive-dark/20 to-transparent" />
          <div className="absolute inset-0 p-card-padding flex flex-col justify-end text-on-primary">
            <span className="font-mono-micro text-mono-micro uppercase tracking-widest text-ochre-light mb-2 bg-olive-dark/50 inline-block w-max px-2 py-1 rounded backdrop-blur-sm">
              Capital Region
            </span>
            <h3 className="font-headline-lg text-headline-lg leading-tight mb-2">
              Lisbon &amp; Surrounds
            </h3>
            <p className="font-body-md text-body-md opacity-90 max-w-md hidden md:block">
              Explore the steep, historic streets, vibrant culinary scene,
              and nearby coastal retreats of Sintra and Cascais.
            </p>
          </div>
        </Link>

        {/* Bento Item 2: Douro Valley (Tall) */}
        <Link
          href="/portugal"
          className="md:col-span-4 row-span-2 group relative rounded-xl overflow-hidden shadow-lg border border-white/40 block"
        >
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
            style={{
              backgroundImage:
                "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDYu4Fau7io9fH__yOAmh3NS8NfSMdk4ppABEZGMyiJwdW_dhtVGIV0Dw8kZR5lK8lak_dEo3IYDDkcBiyUHxBrqgD1OY6SCaop5fhBOUIuWLkFjpQEap2YW6UIWgEQub-GOXL6J16-h9-xPjE5k4xodT3fM956CvzZtrcH2SVBxRa4jyXhODGOllDkrFhiRZSkk1SHeyc6sg3eg112VXti1LIJwp3gJBIAT5_yX8TXauvdhmEtLcwsd8bMv72CDVKpvSHVhqM1u1-q')",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-olive-dark/90 via-olive-dark/30 to-transparent" />
          <div className="absolute inset-0 p-card-padding flex flex-col justify-end text-on-primary">
            <span className="font-mono-micro text-mono-micro uppercase tracking-widest text-ochre-light mb-2 bg-olive-dark/50 inline-block w-max px-2 py-1 rounded backdrop-blur-sm">
              Wine Country
            </span>
            <h3 className="font-headline-sm text-headline-sm leading-tight mb-2">
              Douro Valley
            </h3>
            <p className="font-body-md text-body-md opacity-90 text-sm">
              Terraced vineyards and ancient estates along the golden
              river.
            </p>
          </div>
        </Link>

        {/* Bento Item 3: Azores (Wide) */}
        <Link
          href="/portugal"
          className="md:col-span-12 row-span-1 group relative rounded-xl overflow-hidden shadow-lg border border-white/40 block"
        >
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
            style={{
              backgroundImage:
                "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBVKywJbZwS5PUrrA6MTfs8d39w7yOtkJJUlakoA3aqZmMo4bLGdOn82FnKAJpUqR3Jx9CEwQqheDNpgz4SQ1c8xNuXlkUbJ6P6GIQxYDjHrjZbZrUSTiAh_dzx28ytJ4YG1qFhpPhIPg1LQ5sLWV8Qn6xUwtNOvQhOiFiGt4K6t3ek8exOSJc94DpCxSm2ZZaOX7x8CWip_O1xDmTILAQdtSnFICxCjx6GZQrksj92zpEnN4klxv2zWuS-S2otMfgk_4y9xhmDvjv0')",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-olive-dark/90 via-olive-dark/50 to-transparent" />
          <div className="absolute inset-0 p-card-padding flex flex-col justify-center text-on-primary w-full md:w-1/2">
            <span className="font-mono-micro text-mono-micro uppercase tracking-widest text-secondary-fixed mb-2 bg-olive-dark/50 inline-block w-max px-2 py-1 rounded backdrop-blur-sm">
              Island Archipelago
            </span>
            <h3 className="font-headline-lg text-headline-lg leading-tight mb-2">
              The Azores
            </h3>
            <p className="font-body-md text-body-md opacity-90">
              Volcanic craters, thermal springs, and untouched Atlantic
              wilderness.
            </p>
          </div>
        </Link>
      </div>
    </section>
  );
}