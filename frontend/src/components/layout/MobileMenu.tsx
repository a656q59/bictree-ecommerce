import { useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

import { deliveryPincode, storeCategories } from "../../constants/navigation.ts";
import { useAuth } from "../../features/auth/useAuth.ts";
import { CloseIcon } from "../ui/Icons.tsx";

type MobileMenuProps = {
  open: boolean;
  onClose: () => void;
};

export function MobileMenu({ open, onClose }: MobileMenuProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) {
        return;
      }

      const focusable = dialogRef.current.querySelectorAll<HTMLElement>("a[href], button:not([disabled])");
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) {
        return;
      }

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40">
      <button
        type="button"
        aria-label="Dismiss menu"
        className="absolute inset-0 bg-hero/40"
        onClick={onClose}
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="site-menu-title"
        className="absolute top-0 left-0 flex h-full w-[min(100%,20rem)] flex-col bg-canvas shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <h2 id="site-menu-title" className="text-lg font-semibold text-primary">
            MegaMart
          </h2>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="rounded-lg p-2 text-ink hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <CloseIcon className="size-5" />
          </button>
        </div>
        <div className="flex flex-col gap-1 overflow-y-auto px-4 py-4 text-sm">
          <p className="px-2 py-2 text-muted">Deliver to {deliveryPincode}</p>
          <Link to="/login" onClick={onClose} className="rounded-lg px-2 py-2 hover:bg-surface">
            Track your order
          </Link>
          <Link to="/products" onClick={onClose} className="rounded-lg px-2 py-2 hover:bg-surface">
            All Offers
          </Link>
          {user ? (
            <button
              type="button"
              onClick={() => {
                signOut();
                onClose();
                navigate("/");
              }}
              className="rounded-lg px-2 py-2 text-left hover:bg-surface"
            >
              Sign out
            </button>
          ) : (
            <Link to="/login" onClick={onClose} className="rounded-lg px-2 py-2 hover:bg-surface">
              Sign Up/Sign In
            </Link>
          )}
          <Link to="/cart" onClick={onClose} className="rounded-lg px-2 py-2 hover:bg-surface">
            Cart
          </Link>
          <p className="mt-3 px-2 text-xs font-medium tracking-wide text-muted uppercase">
            Categories
          </p>
          {storeCategories.map((category) => (
            <Link
              key={category.slug}
              to={`/products?category=${category.slug}`}
              onClick={onClose}
              className="rounded-lg px-2 py-2 hover:bg-surface"
            >
              {category.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
