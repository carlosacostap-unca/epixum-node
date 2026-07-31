import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AcademicCollection, { type AcademicCollectionItem } from "./AcademicCollection";
import AcademicLoadingState from "./AcademicLoadingState";
import EnrollmentStatusNotice from "./EnrollmentStatusNotice";
import WeekControls from "./WeekControls";

const refresh = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh, push: vi.fn() }) }));
const publicationAction = vi.fn();
vi.mock("@/lib/cohorts/weeks", () => ({
  setWeekPublicationAction: (...args: unknown[]) => publicationAction(...args),
  deleteWeekAction: vi.fn(),
}));

const baseItem: AcademicCollectionItem = { id: "week-1", position: 1, label: "Semana 1", title: "Introducción", href: "/weeks/1", publication: "published", classCount: 2, assignmentCount: 2, completedAssignments: 1 };

describe("academic content states", () => {
  beforeEach(() => { refresh.mockClear(); publicationAction.mockReset(); });

  it("renders an explicit empty state", () => {
    render(<AcademicCollection items={[]} staff={false} emptyTitle="Todavía no hay semanas publicadas" emptyDescription="El contenido aparecerá cuando esté listo." />);
    expect(screen.getByRole("heading", { name: "Todavía no hay semanas publicadas" })).toBeVisible();
  });

  it("communicates draft and published states with text", () => {
    render(<AcademicCollection staff items={[{ ...baseItem, id: "draft", publication: "draft" }, baseItem]} emptyTitle="Vacío" emptyDescription="Vacío" />);
    expect(screen.getByText("Borrador")).toBeVisible();
    expect(screen.getByText("Publicado")).toBeVisible();
  });

  it("exposes student progress semantics", () => {
    render(<AcademicCollection items={[baseItem]} staff={false} emptyTitle="Vacío" emptyDescription="Vacío" />);
    expect(screen.getByRole("progressbar", { name: "Progreso de Introducción" })).toHaveAttribute("aria-valuenow", "50");
    expect(screen.getByText("1 de 2")).toBeVisible();
  });

  it("explains read-only behavior for a completed enrollment", () => {
    const { rerender } = render(<EnrollmentStatusNotice status="active" />);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    rerender(<EnrollmentStatusNotice status="completed" />);
    expect(screen.getByRole("status")).toHaveTextContent("Cursada finalizada");
    expect(screen.getByRole("status")).toHaveTextContent("no realizar nuevas entregas");
  });

  it("announces route loading without relying on animation", () => {
    render(<AcademicLoadingState />);
    expect(screen.getByRole("status")).toHaveTextContent("Cargando contenido académico");
  });

  it("shows mutation success feedback and refreshes the view", async () => {
    publicationAction.mockResolvedValue({ success: true, message: "Semana publicada." });
    render(<WeekControls cohortId="cohort-1" weekId="week-1" published={false} />);
    fireEvent.click(screen.getByRole("button", { name: "Publicar manualmente" }));
    await waitFor(() => expect(screen.getByText("Semana publicada.")).toBeVisible());
    expect(publicationAction).toHaveBeenCalledWith("cohort-1", "week-1", true);
    expect(refresh).toHaveBeenCalled();
  });

  it("shows recoverable mutation errors", async () => {
    publicationAction.mockResolvedValue({ success: false, error: "No se pudo publicar." });
    render(<WeekControls cohortId="cohort-1" weekId="week-1" published={false} />);
    fireEvent.click(screen.getByRole("button", { name: "Publicar manualmente" }));
    await waitFor(() => expect(screen.getByText("No se pudo publicar.")).toBeVisible());
  });
});
