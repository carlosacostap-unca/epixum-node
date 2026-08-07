import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import StudentContentList from "./StudentContentList";
import StudentContentReader from "./StudentContentReader";
import { WeeklyLearningHero } from "@/components/cohorts/WeeklyCohortHome";
import type { Cohort, ContentSection } from "@/types";
import type { PublicContentRevision } from "@/lib/content/projection";

vi.mock("./StudentContentRuntime", () => ({ default: () => <div>Contenido de prueba</div> }));

const cohort = { id: "cohort00000001", name: "Node 6", slug: "node-6", mode: "weekly", status: "active", created: "", updated: "", collectionId: "cohorts", collectionName: "cohorts" } satisfies Cohort;

describe("student learning journey", () => {
  it("links the weekly continuation action to the last valid block", () => {
    render(<StudentContentList cohortId={cohort.id} weekId="week000000001" sections={[{ id: "section00000001", position: 1, title: "Conocé la terminal", completed: false, started: true, lastViewedAt: "2026-08-02", lastBlockKey: "terminal_practice" }]} progress={{ completed: 0, total: 1, percentage: 0 }} continueSection={{ id: "section00000001", position: 1, title: "Conocé la terminal", completed: false, started: true, lastViewedAt: "2026-08-02", lastBlockKey: "terminal_practice" }} />);

    expect(screen.getByRole("link", { name: "Continuar donde dejé" })).toHaveAttribute("href", `/cohorts/${cohort.id}/weeks/week000000001/content/section00000001#block-terminal_practice`);
  });

  it("presents one primary next step and direct inquiry access on the weekly home", () => {
    render(<WeeklyLearningHero cohort={cohort} learning={{ week: { id: "week000000001", cohort: cohort.id, number: 1, title: "Primeros pasos", publicationStatus: "published", created: "", updated: "", collectionId: "weeks", collectionName: "weeks" }, sections: [], progress: { completed: 2, total: 5, percentage: 40 }, continueSection: { id: "section00000001", position: 3, title: "Instalá Node.js", completed: false, started: true, lastBlockKey: "download" } }} />);

    expect(screen.getByRole("heading", { name: "Instalá Node.js" })).toBeVisible();
    expect(screen.getByText("2 de 5 secciones completadas.", { exact: false })).toBeVisible();
    expect(screen.getByRole("link", { name: /Continuar donde dejé/ })).toHaveAttribute("href", `/cohorts/${cohort.id}/weeks/week000000001/content/section00000001#block-download`);
    expect(screen.getByRole("link", { name: "Ir a consultas" })).toHaveAttribute("href", `/cohorts/${cohort.id}/inquiries`);
  });

  it("shows reader exit and sequential controls in one navigation region", () => {
    const section = { id: "section00000001", cohort: cohort.id, week: "week000000001", position: 1, title: "Terminal", status: "published", currentRevision: "revision0000001", created: "", updated: "", collectionId: "content_sections", collectionName: "content_sections" } satisfies ContentSection;
    const revision = { revisionId: "revision0000001", revisionNumber: 1, requirementsRevision: "requirements1", activities: [], blocks: [] } satisfies PublicContentRevision;
    render(<StudentContentReader cohortId={cohort.id} weekId="week000000001" section={section} revision={revision} progress={null} assetUrls={{}} navigation={{ previous: null, next: { id: "section00000002" }, position: 1, total: 2 }} weekProgress={{ completed: 0, total: 2, percentage: 0 }} />);

    const navigation = screen.getByRole("navigation", { name: "Navegación entre secciones" });
    expect(navigation).toHaveClass("lg:left-72");
    expect(within(navigation).getByRole("link", { name: "Salir" })).toHaveAttribute("href", `/cohorts/${cohort.id}/weeks/week000000001?section=content`);
    expect(within(navigation).getByRole("link", { name: /Siguiente/ })).toBeVisible();
  });
});
