import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AnalyticsFilterBar } from "@/components/analytics/AnalyticsFilterBar";
import { MetricCard } from "@/components/analytics/MetricCard";
import { ProgressMatrix } from "@/components/analytics/ProgressMatrix";
import { assessmentCategoryInsights, assessmentQuestionInsights, normalizeAnalyticsFilters, percentage } from "@/lib/analytics";
import { academicProgressStatus } from "@/lib/cohorts/progress";

const navigation = vi.hoisted(() => ({ replace: vi.fn(), params: new URLSearchParams("search=ana&status=active") }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: navigation.replace }), usePathname: () => "/cohorts/cohort-1/dashboard", useSearchParams: () => navigation.params }));

describe("teaching analytics", () => {
  it("keeps calculation edge cases stable", () => {
    expect(percentage(0, 0)).toBe(0); expect(percentage(2, 3)).toBe(67);
    expect(academicProgressStatus(0, 0)).toBe("empty"); expect(academicProgressStatus(1, 2)).toBe("pending"); expect(academicProgressStatus(2, 2)).toBe("complete");
    expect(assessmentQuestionInsights([{ answers: { q1: "a" } }, { answers: { q1: "b" } }, { answers: {} }], [{ id: "q1", correctOptionId: "a" }])).toEqual([{ questionId: "q1", answered: 2, correct: 1, incorrect: 1, accuracy: 50 }]);
    expect(assessmentCategoryInsights([{ answers: { q1: "a", q2: "b" } }, { answers: { q1: "b", q2: "b" } }], [{ id: "q1", categoryId: "fundamentals", correctOptionId: "a" }, { id: "q2", categoryId: "fundamentals", correctOptionId: "b" }], [{ id: "fundamentals", label: "Fundamentos" }])).toEqual([{ id: "fundamentals", label: "Fundamentos", answered: 4, correct: 3, incorrect: 1, accuracy: 75 }]);
  });

  it("normalizes invalid URL filters", () => {
    expect(normalizeAnalyticsFilters({ period: "week-1", progress: "unknown", status: "completed", search: " Ana " })).toEqual({ period: "week-1", progress: "all", status: "completed", search: "Ana", detail: "" });
  });

  it("updates one URL filter while preserving the remaining context", () => {
    navigation.replace.mockReset();
    render(<AnalyticsFilterBar periods={[{ value: "week-1", label: "Semana 1" }]} statuses={[{ value: "active", label: "Activa" }]} defaultStatus="active" />);
    fireEvent.change(screen.getByRole("combobox", { name: "Período" }), { target: { value: "week-1" } });
    expect(navigation.replace).toHaveBeenCalledWith("/cohorts/cohort-1/dashboard?search=ana&status=active&period=week-1");
  });

  it("makes a metric drill-down an explicit contextual link", () => {
    render(<MetricCard label="Requieren atención" value={3} href="/cohorts/cohort-1/dashboard?period=week-1&detail=attention" />);
    expect(screen.getByRole("link", { name: /Ver detalle/ })).toHaveAttribute("href", "/cohorts/cohort-1/dashboard?period=week-1&detail=attention");
  });

  it("exposes equivalent labeled progress in desktop and mobile representations", () => {
    const { container } = render(<ProgressMatrix periods={[{ id: "week-1", label: "Semana 1" }]} rows={[{ id: "student-1", name: "Ana Pérez", email: "ana@example.com", cells: [{ periodId: "week-1", status: "pending", completed: 1, total: 2 }] }]} />);
    expect(screen.getAllByText("Ana Pérez")).toHaveLength(2); expect(screen.getAllByText("Semana 1")).toHaveLength(2); expect(screen.getAllByText("Pendiente")).toHaveLength(2); expect(screen.getAllByText("1/2 entregas")).toHaveLength(2);
    expect(container.querySelector(".max-w-full.overflow-x-auto")).toBeInTheDocument(); expect(container.querySelector(".lg\\:hidden")).toBeInTheDocument();
  });
});
