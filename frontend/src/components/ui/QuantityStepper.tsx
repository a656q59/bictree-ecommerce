type QuantityStepperProps = {
  value: number;
  max: number;
  onChange: (value: number) => void;
  disabled?: boolean;
};

export function QuantityStepper({ value, max, onChange, disabled = false }: QuantityStepperProps) {
  const atMin = value <= 1;
  const atMax = max <= 0 || value >= max;

  return (
    <div className="inline-flex items-center rounded-full border border-line">
      <button
        type="button"
        aria-label="Decrease quantity"
        disabled={disabled || atMin}
        onClick={() => onChange(value - 1)}
        className="size-10 rounded-full text-lg text-ink hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-40"
      >
        −
      </button>
      <span className="min-w-8 text-center text-sm font-medium text-ink" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        aria-label="Increase quantity"
        disabled={disabled || atMax}
        onClick={() => onChange(value + 1)}
        className="size-10 rounded-full text-lg text-ink hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-40"
      >
        +
      </button>
    </div>
  );
}
