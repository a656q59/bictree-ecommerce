import { useState } from "react";

import watchUrl from "../../assets/smartwatch.svg";
import { ChevronLeftIcon, ChevronRightIcon } from "../../components/ui/Icons.tsx";

const slides = [
  {
    id: "wearable",
    kicker: "Best Deal Online on smart watches",
    title: "SMART WEARABLE.",
    offer: "UP TO 80% OFF",
    image: watchUrl,
    imageAlt: "Blue smartwatch",
  },
];

export function HomeHero() {
  const [index, setIndex] = useState(0);
  const slide = slides[index] ?? slides[0];
  const hasMany = slides.length > 1;

  function show(next: number) {
    const count = slides.length;
    setIndex((next + count) % count);
  }

  return (
    <section aria-roledescription="carousel" aria-label="Promotions" className="relative">
      <div className="overflow-hidden rounded-2xl bg-hero px-6 py-8 text-white md:px-12 md:py-10">
        <div className="grid items-center gap-6 md:grid-cols-[1.3fr_0.7fr]">
          <div>
            <p className="text-sm md:text-base">{slide.kicker}</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-5xl">{slide.title}</h1>
            <p className="mt-3 text-base font-semibold md:text-lg">{slide.offer}</p>
            <div className="mt-8 flex gap-2" role="tablist" aria-label="Promotion slides">
              {slides.map((item, dotIndex) => (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={dotIndex === index}
                  aria-label={`Show slide ${dotIndex + 1}`}
                  onClick={() => setIndex(dotIndex)}
                  className={`h-1.5 rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
                    dotIndex === index ? "w-6 bg-white" : "w-1.5 bg-white/40"
                  }`}
                />
              ))}
            </div>
          </div>
          <img src={slide.image} alt={slide.imageAlt} className="mx-auto h-40 w-auto md:h-52" />
        </div>
      </div>
      <button
        type="button"
        onClick={() => show(index - 1)}
        disabled={!hasMany}
        aria-label="Previous promotion"
        className="absolute top-1/2 left-2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-canvas text-ink shadow-sm hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50 md:-left-2"
      >
        <ChevronLeftIcon className="size-5" />
      </button>
      <button
        type="button"
        onClick={() => show(index + 1)}
        disabled={!hasMany}
        aria-label="Next promotion"
        className="absolute top-1/2 right-2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-canvas text-ink shadow-sm hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50 md:-right-2"
      >
        <ChevronRightIcon className="size-5" />
      </button>
    </section>
  );
}
