import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Inquiry } from "@/types";
import InquiryList from "./InquiryList";

const navigation = vi.hoisted(() => ({ replace: vi.fn(), params: new URLSearchParams("context=sprint:sprint-1&status=pending") }));
vi.mock("next/navigation", () => ({
  usePathname: () => "/cohorts/cohort-1/inquiries",
  useRouter: () => ({ replace: navigation.replace }),
  useSearchParams: () => navigation.params,
}));

const inquiry = (values: Partial<Inquiry> & Pick<Inquiry, "id" | "title">): Inquiry => ({
  collectionId: "inquiries",
  collectionName: "inquiries",
  created: "2026-08-01T12:00:00.000Z",
  updated: "2026-08-01T12:00:00.000Z",
  description: "Necesito ayuda",
  status: "Pendiente",
  author: "student-1",
  cohort: "cohort-1",
  ...values,
} as Inquiry);

describe("teacher inquiry inbox", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-02T12:00:00.000Z"));
    navigation.replace.mockReset();
  });
  afterEach(() => vi.useRealTimers());

  it("matches an exact sprint relation, discloses filters, waiting time, and oldest pending first", () => {
    const inquiries = [
      inquiry({ id: "new", title: "Más nueva", updated: "2026-08-02T10:00:00.000Z", assignment: "assignment-1", expand: { assignment: { id: "assignment-1", title: "TP sprint", sprint: "sprint-1" } as never } }),
      inquiry({ id: "old", title: "Más antigua", assignment: "assignment-2", expand: { assignment: { id: "assignment-2", title: "Otro TP", sprint: "sprint-1" } as never } }),
      inquiry({ id: "other", title: "Otro sprint", assignment: "assignment-3", expand: { assignment: { id: "assignment-3", title: "TP ajeno", sprint: "sprint-2" } as never } }),
    ];
    render(<InquiryList inquiries={inquiries} currentUser={null} showSearch canCreate={false} context={{ basePath: "/cohorts/cohort-1/inquiries" }} />);
    expect(screen.getByRole("status")).toHaveTextContent("2 consultas coincidentes · Sprint seleccionado · Pendientes");
    expect(screen.queryByText("Otro sprint")).not.toBeInTheDocument();
    expect(screen.getAllByRole("link")[0]).toHaveTextContent("Más antigua");
    expect(screen.getByText("Espera 1 d")).toBeVisible();
  });

  it("offers a context-aware reset without claiming an all-clear state", () => {
    render(<InquiryList inquiries={[]} currentUser={null} showSearch canCreate={false} />);
    expect(screen.getByText("No encontramos consultas")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Limpiar filtros" }));
    expect(navigation.replace).toHaveBeenCalledWith("/cohorts/cohort-1/inquiries");
  });
});
