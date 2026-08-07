import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import TeacherStudentOverview from "./TeacherStudentOverview";
import type { Cohort, User } from "@/types";
import type { TeacherStudentOverviewData } from "@/lib/teacher/data";

const cohort = record({ id: "c1", name: "Cohorte 1", slug: "c1", mode: "weekly", status: "active" }) as Cohort;
const student = record({ id: "s1", name: "Ana Pérez", email: "ana@example.com", username: "ana", role: "estudiante" }) as User;

describe("teacher student overview", () => {
  it("keeps period, state, and evidence action associated", () => {
    render(<TeacherStudentOverview cohort={cohort} returnHref="/cohorts/c1/dashboard?period=w1" signal="period:w1" data={overview()} />);
    expect(screen.getByRole("heading", { name: "Ana Pérez" })).toBeInTheDocument();
    expect(screen.getAllByText("Semana 1").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Vencida").length).toBeGreaterThan(0);
    expect(screen.getByRole("link", { name: /TP 1/ })).toHaveAttribute("href", "/cohorts/c1/assignments/a1?student=s1");
    expect(screen.getByRole("link", { name: "Volver al tablero" })).toHaveAttribute("href", "/cohorts/c1/dashboard?period=w1");
    expect(screen.getByText(/un período del tablero/)).toBeInTheDocument();
  });

  it("distinguishes unconfigured and unavailable evidence", () => {
    const data = overview(); data.periods.push(record({ id: "w2", cohort: "c1", number: 2, title: "Semana 2", publicationStatus: "published" }) as never); data.sources.assessments = { available: false, data: [], message: "offline" };
    render(<TeacherStudentOverview cohort={cohort} returnHref="/cohorts/c1/dashboard" data={data} />);
    expect(screen.getAllByText("Sin actividades").length).toBeGreaterThan(0);
    expect(screen.getByRole("region", { name: "Diagnóstico" })).toHaveTextContent("Información no disponible");
    expect(screen.getByText("Sin consultas registradas")).toBeInTheDocument();
  });
});

function overview(): TeacherStudentOverviewData {
  return {
    enrollment: record({ id: "e1", user: "s1", cohort: "c1", status: "active", entryType: "new", enrolledAt: "2026-01-01", expand: { user: student } }) as never,
    student,
    periods: [record({ id: "w1", cohort: "c1", number: 1, title: "Semana 1", endDate: "2020-01-01", publicationStatus: "published" }) as never],
    assignments: [record({ id: "a1", title: "TP 1", description: "", week: "w1" }) as never],
    sources: {
      deliveries: { available: true, data: [] }, inquiries: { available: true, data: [] }, assessments: { available: true, data: [] }, reviews: { available: true, data: [] }, followUps: { available: true, data: [] },
    },
  };
}
function record<T extends Record<string, unknown>>(value: T) { return { collectionId: "test", collectionName: "test", created: "2026-01-01T00:00:00Z", updated: "2026-01-01T00:00:00Z", ...value }; }
