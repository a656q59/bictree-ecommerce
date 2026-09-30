import { Link } from "react-router-dom";

import { ChevronRightIcon } from "../ui/Icons.tsx";

type SectionHeaderProps = {
  title: string;
  highlight?: string;
  to: string;
};

export function SectionHeader({ title, highlight, to }: SectionHeaderProps) {
  return (
    <div className="flex items-end justify-between gap-4">
      <h2 className="text-lg font-medium text-ink md:text-xl">
        {title}
        {highlight ? <span className="font-semibold text-primary">{highlight}</span> : null}
      </h2>
      <Link
        to={to}
        className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-primary hover:text-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        View All
        <ChevronRightIcon className="size-4" />
      </Link>
    </div>
  );
}
