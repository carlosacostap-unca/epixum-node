import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import TeacherAttentionWorkspace from "./TeacherAttentionWorkspace";
import type { TeacherAttentionData } from "@/lib/teacher/data";
import type { User } from "@/types";

const user = record({ id: "t1", name: "María Docente", email: "maria@example.com", username: "maria", role: "docente" }) as User;
const sources = { inquiries: { available: true, count: 1 }, deliveries: { available: true, count: 1 }, followUps: { available: true, count: 0 }, reviews: { available: true, count: 0 }, enrollmentRequests: { available: true, count: 0 } };

describe("teacher attention workspace", () => {
  it("keeps multi-cohort context and urgency order actionable", () => {
    const data: TeacherAttentionData = { allClear: false, sources, items: [item("critical", "Cohorte A", "/critical"), item("routine", "Cohorte B", "/routine")] };
    render(<TeacherAttentionWorkspace user={user} data={data} />);
    const queue = screen.getByRole("region", { name: "Atención docente" });
    expect(within(queue).getByText("Cohorte A")).toBeInTheDocument(); expect(within(queue).getByText("Cohorte B")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Abrir critical" })).toHaveAttribute("href", "/critical");
    const cards = within(queue).getAllByRole("link"); expect(cards[0]).toHaveAttribute("href", "/critical");
  });

  it("distinguishes partial failure from an all-clear state", () => {
    const partial: TeacherAttentionData = { items: [], allClear: false, sources: { ...sources, inquiries: { available: false, count: 0, message: "offline" } } };
    const { rerender } = render(<TeacherAttentionWorkspace user={user} data={partial} />);
    expect(screen.getByText("Información parcial")).toBeInTheDocument(); expect(screen.queryByText("No hay trabajo pendiente")).not.toBeInTheDocument();
    rerender(<TeacherAttentionWorkspace user={user} data={{ items: [], allClear: true, sources: { ...sources, inquiries: { available: true, count: 0 }, deliveries: { available: true, count: 0 } } }} />);
    expect(screen.getByText("No hay trabajo pendiente")).toBeInTheDocument();
  });
});

function item(urgency: "critical" | "routine", cohortName: string, href: string) { return { id: urgency, type: "inquiry" as const, urgency, cohortId: urgency, cohortName, contextLabel: "Semana 1", title: `Caso ${urgency}`, reason: "Consulta pendiente", timestamp: "2026-08-01T00:00:00Z", href, actionLabel: `Abrir ${urgency}` }; }
function record<T extends Record<string, unknown>>(value: T) { return { collectionId: "test", collectionName: "test", created: "2026-01-01T00:00:00Z", updated: "2026-01-01T00:00:00Z", ...value }; }

