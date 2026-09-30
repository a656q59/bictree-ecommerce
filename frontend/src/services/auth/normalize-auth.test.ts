import { describe, expect, it } from "vitest";

import { normalizeAuthSession, validationMessages } from "./normalize-auth.ts";

describe("normalizeAuthSession", () => {
  it("accepts either accessToken or token", () => {
    const session = normalizeAuthSession(
      { data: { token: "abc", user: { email: "a@shop.test" } } },
      "a@shop.test",
    );

    expect(session.accessToken).toBe("abc");
    expect(session.user.email).toBe("a@shop.test");
  });
});

describe("validationMessages", () => {
  it("reads a field message from an object or a list", () => {
    expect(validationMessages({ email: ["Enter a valid email"] }).email).toBe("Enter a valid email");
    expect(validationMessages([{ field: "password", message: "Too short" }]).password).toBe("Too short");
  });
});
