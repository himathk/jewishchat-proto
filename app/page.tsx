import { SearchProvider } from "@/components/providers/SearchProvider";
import { Header } from "@/components/layout/Header";
import { Hero } from "@/components/hero/Hero";
import { SearchDock } from "@/components/hero/SearchDock";
import { StatBand } from "@/components/sections/StatBand";
import { CategoryLattice } from "@/components/sections/CategoryLattice";
import { TrendingGroups } from "@/components/sections/TrendingGroups";
import { RecentGroups } from "@/components/sections/RecentGroups";

export default function Home() {
  return (
    <SearchProvider>
      <Header />
      {/* SearchDock is a root-level sibling on purpose: a transformed ancestor
          would become the containing block for its `position: fixed`. */}
      <SearchDock />
      <main>
        <Hero />
        <StatBand />
        <CategoryLattice />
        <TrendingGroups />
        <RecentGroups />
      </main>
    </SearchProvider>
  );
}
