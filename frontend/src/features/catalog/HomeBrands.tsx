import { useState } from "react";
import { Link } from "react-router-dom";

import { SectionHeader } from "../../components/common/SectionHeader.tsx";
import { brandOffers } from "../../constants/home.ts";

export function HomeBrands() {
  const [page, setPage] = useState(0);
  const pages = [brandOffers];
  const current = pages[page] ?? pages[0];

  return (
    <section aria-roledescription="carousel" aria-label="Electronics brands" className="flex flex-col gap-4">
      <SectionHeader title="Top " highlight="Electronics Brands" to="/products?category=electronics" />
      <ul className="grid gap-4 md:grid-cols-3">
        {current.map((brand) => (
          <li key={brand.name}>
            <Link
              to={`/products?q=${encodeURIComponent(brand.query)}`}
              className={`flex min-h-40 items-center justify-between gap-4 rounded-2xl px-5 py-5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${brand.surface} ${brand.ink}`}
            >
              <span>
                <span className="inline-flex rounded-full bg-white/15 px-2 py-1 text-[11px] font-semibold tracking-wide">
                  {brand.eyebrow}
                </span>
                <span className="mt-3 block text-xl font-semibold">{brand.name}</span>
                <span className="mt-2 block text-sm font-medium">UP TO 80% OFF</span>
              </span>
              <span
                aria-hidden="true"
                className="h-24 w-14 shrink-0 rounded-2xl border-2 border-current opacity-80"
              />
            </Link>
          </li>
        ))}
      </ul>
      <div className="flex justify-center gap-2" role="tablist" aria-label="Brand pages">
        {pages.map((_, dotIndex) => (
          <button
            key={dotIndex}
            type="button"
            role="tab"
            aria-selected={dotIndex === page}
            aria-label={`Show brand page ${dotIndex + 1}`}
            onClick={() => setPage(dotIndex)}
            className={`h-1.5 rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
              dotIndex === page ? "w-6 bg-primary" : "w-1.5 bg-line"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
