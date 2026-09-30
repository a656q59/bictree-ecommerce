import { Link, useLocation, useSearchParams } from "react-router-dom";

import { storeCategories } from "../../constants/navigation.ts";
import { ChevronDownIcon } from "../ui/Icons.tsx";

export function CategoryNav() {
  const { pathname } = useLocation();
  const [params] = useSearchParams();
  const queryCategory = params.get("category");
  const activeSlug = queryCategory ?? (pathname === "/" ? "groceries" : null);

  return (
    <nav aria-label="Categories" className="border-b border-line bg-canvas">
      <ul className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-4 py-3">
        {storeCategories.map((category) => {
          const selected = category.slug === activeSlug;
          return (
            <li key={category.slug} className="shrink-0">
              <Link
                to={`/products?category=${category.slug}`}
                aria-current={selected ? "page" : undefined}
                className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-sm whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                  selected
                    ? "border-primary bg-primary text-white"
                    : "border-line bg-canvas text-ink hover:border-primary hover:text-primary"
                }`}
              >
                {category.label}
                <ChevronDownIcon className="size-3.5" />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
