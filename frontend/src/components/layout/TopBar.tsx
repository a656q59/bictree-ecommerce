import { Link } from "react-router-dom";

import { PinIcon, TagIcon, TruckIcon } from "../ui/Icons.tsx";
import { deliveryPincode } from "../../constants/navigation.ts";

export function TopBar() {
  return (
    <div className="bg-info text-xs text-ink">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-2">
        <p>Welcome to worldwide MegaMart!</p>
        <div className="hidden items-center gap-5 sm:flex">
          <p className="inline-flex items-center gap-1.5">
            <PinIcon className="size-3.5" />
            Deliver to {deliveryPincode}
          </p>
          <Link to="/login" className="inline-flex items-center gap-1.5 hover:text-primary">
            <TruckIcon className="size-3.5" />
            Track your order
          </Link>
          <Link to="/products" className="inline-flex items-center gap-1.5 hover:text-primary">
            <TagIcon className="size-3.5" />
            All Offers
          </Link>
        </div>
      </div>
    </div>
  );
}
