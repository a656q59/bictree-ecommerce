import { Link } from "react-router-dom";

type EmptyStateProps = {
  title: string;
  message: string;
  actionLabel?: string;
  actionTo?: string;
};

export function EmptyState({ title, message, actionLabel, actionTo }: EmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-line px-6 py-10 text-center">
      <h3 className="text-base font-semibold text-ink">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted">{message}</p>
      {actionLabel && actionTo ? (
        <Link
          to={actionTo}
          className="mt-5 inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
