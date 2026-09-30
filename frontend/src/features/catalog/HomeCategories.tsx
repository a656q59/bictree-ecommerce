import type { ReactNode } from "react";
import { Link } from "react-router-dom";

import { SectionHeader } from "../../components/common/SectionHeader.tsx";
import { topCategories } from "../../constants/home.ts";

const marks: Record<(typeof topCategories)[number]["slug"], ReactNode> = {
  mobile: (
    <svg viewBox="0 0 24 24" className="size-8" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="7" y="3" width="10" height="18" rx="2" />
      <path d="M11 18h2" />
    </svg>
  ),
  cosmetics: (
    <svg viewBox="0 0 24 24" className="size-8" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M9 8h6l-1 13H10L9 8Z" />
      <path d="M10 8V5h4v3" />
    </svg>
  ),
  electronics: (
    <svg viewBox="0 0 24 24" className="size-8" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="4" y="6" width="16" height="10" rx="1.5" />
      <path d="M8 20h8" />
    </svg>
  ),
  furniture: (
    <svg viewBox="0 0 24 24" className="size-8" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M5 11h14v5H5z" />
      <path d="M7 11V8h10v3M7 16v3M17 16v3" />
    </svg>
  ),
  watches: (
    <svg viewBox="0 0 24 24" className="size-8" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="8" y="6" width="8" height="12" rx="2" />
      <path d="M10 6V4h4v2M10 18v2h4v-2M12 10v3l2 1" />
    </svg>
  ),
  decor: (
    <svg viewBox="0 0 24 24" className="size-8" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M12 21V10" />
      <path d="M12 10c-3 0-5-2-5-5 3 0 5 2 5 5Zm0 0c3 0 5-2 5-5-3 0-5 2-5 5Z" />
    </svg>
  ),
  accessories: (
    <svg viewBox="0 0 24 24" className="size-8" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="12" cy="14" r="4" />
      <path d="M12 10V4M9 6h6" />
    </svg>
  ),
};

export function HomeCategories() {
  return (
    <section className="flex flex-col gap-6">
      <SectionHeader title="Shop From " highlight="Top Categories" to="/products" />
      <ul className="flex gap-4 overflow-x-auto pb-2">
        {topCategories.map((category) => (
          <li key={category.slug} className="w-24 shrink-0">
            <Link
              to={`/products?category=${category.slug}`}
              className="flex flex-col items-center gap-3 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <span
                className={`flex size-20 items-center justify-center rounded-full bg-surface text-sm font-semibold text-primary ${
                  category.slug === "mobile" ? "ring-2 ring-primary" : "ring-2 ring-transparent"
                }`}
              >
                {marks[category.slug]}
              </span>
              <span className="text-center text-sm text-ink">{category.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
