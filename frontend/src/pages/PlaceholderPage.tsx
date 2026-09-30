type PlaceholderPageProps = {
  title: string;
  note: string;
};

export function PlaceholderPage({ title, note }: PlaceholderPageProps) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="text-2xl font-semibold text-ink">{title}</h1>
      <p className="mt-2 max-w-xl text-sm text-muted">{note}</p>
    </section>
  );
}
