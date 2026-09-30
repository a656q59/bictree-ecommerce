import { describe, expect, it } from "vitest";

import { safeRedirect } from "./safe-redirect.ts";

describe("safeRedirect", () => {
  it("keeps in-app paths and drops external or login targets", () => {
    expect(safeRedirect("/cart")).toBe("/cart");
    expect(safeRedirect("//evil.test")).toBeNull();
    expect(safeRedirect("/login")).toBeNull();
    expect(safeRedirect("https://evil.test")).toBeNull();
  });
});
