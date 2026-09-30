type ErrorStateProps = {
  title: string;
  message: string;
  onRetry?: () => void;
  retrying?: boolean;
};

export function ErrorState({ title, message, onRetry, retrying = false }: ErrorStateProps) {
  return (
    <div className="rounded-2xl border border-line bg-surface px-6 py-10 text-center" role="alert">
      <h3 className="text-base font-semibold text-ink">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted">{message}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          disabled={retrying}
          className="mt-5 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60"
        >
          {retrying ? "Retrying..." : "Try again"}
        </button>
      ) : null}
    </div>
  );
}
