import { render } from "@testing-library/react";
import axe from "axe-core";
import { describe, expect, it, vi } from "vitest";
import AppShellClient from "@/components/shell/AppShellClient";
import LoginPage from "@/app/login/page";
import type { Cohort, User, UserRole } from "@/types";

vi.mock("next/navigation", () => ({ usePathname: () => "/cohorts/abcdefghijklmno", useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }) }));
vi.mock("next/image", () => ({ default: ({ alt }: { alt: string }) => <span role={alt ? "img" : undefined} aria-label={alt || undefined} /> }));
vi.mock("@/lib/pocketbase", () => ({ default: { authStore: { clear: vi.fn(), exportToCookie: vi.fn() }, collection: vi.fn() } }));

const cohort = { id: "abcdefghijklmno", name: "Node 6", slug: "node-6", mode: "sprints_and_teams", status: "active", created: "", updated: "", collectionId: "cohorts", collectionName: "cohorts" } satisfies Cohort;
const user = (role: UserRole): User => ({ id: `${role}1234567890`, name: `Persona ${role}`, email: `${role}@example.com`, role, avatar: "", username: role, created: "", updated: "", collectionId: "users", collectionName: "users" });

async function expectNoSeriousViolations(container: HTMLElement) {
  const result = await axe.run(container, { resultTypes: ["violations"] });
  const serious = result.violations.filter(item => item.impact === "serious" || item.impact === "critical");
  expect(serious, serious.map(item => `${item.id}: ${item.help}`).join("\n")).toEqual([]);
}

describe("automated accessibility smoke audit", () => {
  it("passes public access without serious Axe violations", async () => {
    const { container } = render(<LoginPage />);
    await expectNoSeriousViolations(container);
  });

  for (const role of ["estudiante", "docente", "admin"] as const) {
    it(`passes the ${role} shell without serious Axe violations`, async () => {
      const { container } = render(<AppShellClient user={user(role)} cohorts={[cohort]}><main><h1>Inicio de {role}</h1><button>Acción principal</button></main></AppShellClient>);
      await expectNoSeriousViolations(container);
    });
  }
});
