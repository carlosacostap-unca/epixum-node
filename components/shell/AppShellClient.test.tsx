import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AppShellClient from "./AppShellClient";
import type { Cohort, User } from "@/types";

const push = vi.fn();
vi.mock("next/navigation", () => ({ usePathname: () => "/cohorts/abcdefghijklmno/weeks", useRouter: () => ({ push, refresh: vi.fn() }) }));
vi.mock("next/image", () => ({ default: ({ alt }: { alt: string }) => <span role={alt ? "img" : undefined} aria-label={alt || undefined} /> }));
vi.mock("@/lib/pocketbase", () => ({ default: { authStore: { clear: vi.fn() } } }));

const user = { id: "user12345678901", name: "Ana Alumna", email: "ana@example.com", role: "estudiante", avatar: "", username: "ana", created: "", updated: "", collectionId: "users", collectionName: "users" } satisfies User;
const cohorts = [
  { id: "abcdefghijklmno", name: "Node 6", slug: "node-6", mode: "weekly", status: "active", created: "", updated: "", collectionId: "cohorts", collectionName: "cohorts" },
  { id: "pqrstuvwxyzabcd", name: "Node 7", slug: "node-7", mode: "sprints_and_teams", status: "active", created: "", updated: "", collectionId: "cohorts", collectionName: "cohorts" },
] satisfies Cohort[];

describe("application shell", () => {
  beforeEach(() => push.mockClear());

  it("renders role-safe desktop and mobile navigation without horizontal collections", () => {
    render(<AppShellClient user={user} cohorts={cohorts}><main>Contenido</main></AppShellClient>);
    const desktop = screen.getByRole("navigation", { name: "Navegación principal" });
    expect(within(desktop).getByRole("link", { name: "Semanas" })).toHaveAttribute("aria-current", "page");
    expect(within(desktop).getByRole("link", { name: "Consultas" })).toBeVisible();
    expect(within(desktop).queryByRole("link", { name: "Administrar usuarios" })).not.toBeInTheDocument();
    const mobile = screen.getByRole("navigation", { name: "Navegación principal móvil" });
    expect(mobile).toHaveClass("grid");
    expect(within(mobile).getAllByRole("link").length).toBeLessThanOrEqual(5);
  });

  it("switches cohorts through a canonical cohort root", () => {
    render(<AppShellClient user={user} cohorts={cohorts}><main>Contenido</main></AppShellClient>);
    const switches = screen.getAllByRole("combobox", { name: "Cohorte activa" });
    fireEvent.change(switches[0], { target: { value: "pqrstuvwxyzabcd" } });
    expect(push).toHaveBeenCalledWith("/cohorts/pqrstuvwxyzabcd");
  });

  it("removes redundant cohort controls for a student with one active enrollment", () => {
    render(<AppShellClient user={user} cohorts={[cohorts[0]]}><main>Contenido</main></AppShellClient>);

    expect(screen.queryByRole("combobox", { name: "Cohorte activa" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Cohortes" })).not.toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Navegación principal" })).toHaveTextContent("Semanas");
  });
});
