// @vitest-environment node

import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { proxy } from "./proxy";

describe("authentication proxy", () => {
  it("redirects a visitor without a session to the login page", () => {
    const response = proxy(new NextRequest("https://node.epixum.com/"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("https://node.epixum.com/login");
  });

  it("allows the login page to load when a stale auth cookie exists", () => {
    const request = new NextRequest("https://node.epixum.com/login", {
      headers: { cookie: "pb_auth=stale-session" },
    });

    const response = proxy(request);

    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
    expect(response.headers.get("x-middleware-next")).toBe("1");
  });
});
