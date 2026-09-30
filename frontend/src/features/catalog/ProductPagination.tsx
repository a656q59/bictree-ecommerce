type ProductPaginationProps = {
  page: number;
  totalPages: number;
  onPage: (page: number) => void;
};

export function ProductPagination({ page, totalPages, onPage }: ProductPaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const pages = pageNumbers(page, totalPages);

  return (
    <nav aria-label="Pagination" className="flex flex-wrap items-center justify-center gap-2">
      <button
        type="button"
        onClick={() => onPage(page - 1)}
        disabled={page <= 1}
        className="rounded-full border border-line px-4 py-2 text-sm text-ink hover:border-primary hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50"
      >
        Previous
      </button>
      {pages.map((item, index) =>
        item === "gap" ? (
          <span key={`gap-${index}`} className="px-1 text-sm text-muted">
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            aria-current={item === page ? "page" : undefined}
            onClick={() => onPage(item)}
            className={`size-10 rounded-full text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
              item === page ? "bg-primary text-white" : "border border-line text-ink hover:border-primary"
            }`}
          >
            {item}
          </button>
        ),
      )}
      <button
        type="button"
        onClick={() => onPage(page + 1)}
        disabled={page >= totalPages}
        className="rounded-full border border-line px-4 py-2 text-sm text-ink hover:border-primary hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50"
      >
        Next
      </button>
    </nav>
  );
}

function pageNumbers(page: number, totalPages: number): Array<number | "gap"> {
  const wanted = new Set([1, totalPages, page - 1, page, page + 1]);
  const sorted = [...wanted].filter((item) => item >= 1 && item <= totalPages).sort((a, b) => a - b);
  const items: Array<number | "gap"> = [];

  for (const item of sorted) {
    const previous = items.at(-1);
    if (typeof previous === "number" && item - previous > 1) {
      items.push("gap");
    }
    items.push(item);
  }

  return items;
}
