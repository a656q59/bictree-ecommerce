type ProductGridSkeletonProps = {
  count?: number;
};

export function ProductGridSkeleton({ count = 5 }: ProductGridSkeletonProps) {
  return (
    <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5" aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <li key={index} className="rounded-xl border border-line p-3">
          <div className="h-36 animate-pulse rounded-lg bg-surface" />
          <div className="mt-3 h-4 w-3/4 animate-pulse rounded bg-surface" />
          <div className="mt-2 h-4 w-1/2 animate-pulse rounded bg-surface" />
          <div className="mt-2 h-3 w-2/5 animate-pulse rounded bg-surface" />
        </li>
      ))}
    </ul>
  );
}
