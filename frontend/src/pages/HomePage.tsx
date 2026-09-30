import { HomeBrands } from "../features/catalog/HomeBrands.tsx";
import { HomeCategories } from "../features/catalog/HomeCategories.tsx";
import { HomeDeals } from "../features/catalog/HomeDeals.tsx";
import { HomeHero } from "../features/catalog/HomeHero.tsx";

export function HomePage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-12 px-4 py-6">
      <HomeHero />
      <HomeDeals />
      <HomeCategories />
      <HomeBrands />
    </div>
  );
}
