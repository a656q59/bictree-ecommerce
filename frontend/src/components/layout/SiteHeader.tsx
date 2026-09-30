import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import { useAuth } from "../../features/auth/useAuth.ts";
import { CartIcon, ListIcon, MenuIcon, SearchIcon, UserIcon } from "../ui/Icons.tsx";

type SiteHeaderProps = {
  onOpenMenu: () => void;
};

type SearchFieldProps = {
  initialQuery: string;
  onOpenMenu: () => void;
};

function SearchField({ initialQuery, onOpenMenu }: SearchFieldProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState(initialQuery);

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextQuery = query.trim();
    navigate(nextQuery ? `/products?q=${encodeURIComponent(nextQuery)}` : "/products");
  }

  return (
    <form
      role="search"
      onSubmit={handleSearch}
      className="order-3 flex w-full items-center rounded-full bg-surface px-3 md:order-2 md:w-auto md:min-w-0 md:flex-1"
    >
      <SearchIcon className="size-4 shrink-0 text-muted" />
      <label htmlFor="site-search" className="sr-only">
        Search essentials, groceries and more
      </label>
      <input
        id="site-search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search essentials, groceries and more..."
        className="w-full bg-transparent px-2 py-2.5 text-sm text-ink outline-none placeholder:text-muted"
      />
      <button
        type="button"
        onClick={onOpenMenu}
        aria-label="Browse categories"
        className="rounded-full p-1.5 text-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <ListIcon className="size-4" />
      </button>
    </form>
  );
}

export function SiteHeader({ onOpenMenu }: SiteHeaderProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const queryFromUrl = params.get("q") ?? "";

  return (
    <header className="border-b border-line bg-canvas">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-3 px-4 py-3">
        <div className="order-1 flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenMenu}
            aria-label="Open menu"
            className="rounded-lg p-2 text-ink hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <MenuIcon className="size-5" />
          </button>
          <Link to="/" className="text-xl font-semibold text-primary">
            MegaMart
          </Link>
        </div>

        <SearchField key={queryFromUrl} initialQuery={queryFromUrl} onOpenMenu={onOpenMenu} />

        <div className="order-2 ml-auto flex items-center gap-2 md:order-3 md:ml-0">
          {user ? (
            <button
              type="button"
              onClick={() => {
                signOut();
                navigate("/");
              }}
              className="inline-flex items-center gap-2 rounded-full px-2 py-2 text-sm text-ink hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <UserIcon className="size-5" />
              <span className="hidden max-w-40 truncate lg:inline">{user.email}</span>
              <span className="hidden lg:inline">Sign out</span>
            </button>
          ) : (
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-full px-2 py-2 text-sm text-ink hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <UserIcon className="size-5" />
              <span className="hidden lg:inline">Sign Up/Sign In</span>
            </Link>
          )}
          <Link
            to="/cart"
            className="inline-flex items-center gap-2 rounded-full px-2 py-2 text-sm text-ink hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <CartIcon className="size-5" />
            <span className="hidden lg:inline">Cart</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
