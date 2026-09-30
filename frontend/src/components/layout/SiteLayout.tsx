import { useCallback, useState } from "react";
import { Outlet } from "react-router-dom";

import { CategoryNav } from "./CategoryNav.tsx";
import { MobileMenu } from "./MobileMenu.tsx";
import { SiteHeader } from "./SiteHeader.tsx";
import { TopBar } from "./TopBar.tsx";

export function SiteLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-full focus:bg-primary focus:px-3 focus:py-2 focus:text-sm focus:text-white"
      >
        Skip to content
      </a>
      <TopBar />
      <SiteHeader onOpenMenu={() => setMenuOpen(true)} />
      <CategoryNav />
      <MobileMenu open={menuOpen} onClose={closeMenu} />
      <main id="content" tabIndex={-1} className="outline-none">
        <Outlet />
      </main>
    </div>
  );
}
