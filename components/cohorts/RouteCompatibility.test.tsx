import { act, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { appendSearchParams, cohortPath } from "@/lib/cohorts/route-compatibility";

describe("cohort route history", () => {
  it("restores URL-backed filters with browser back and forward", async () => {
    const root = cohortPath("cohort-1", "/dashboard");
    window.history.replaceState({}, "", appendSearchParams(root, { period: "sprint-1", detail: "students" }));
    window.history.pushState({}, "", appendSearchParams(root, { period: "sprint-2", detail: "attention" }));

    act(() => window.history.back());
    await waitFor(() => expect(window.location.search).toBe("?period=sprint-1&detail=students"));

    act(() => window.history.forward());
    await waitFor(() => expect(window.location.search).toBe("?period=sprint-2&detail=attention"));
  });
});
