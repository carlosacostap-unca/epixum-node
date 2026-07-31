import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import InquiryDetailsHeader from "@/components/inquiries/InquiryDetailsHeader";
import ReviewsManager from "@/components/reviews/ReviewsManager";
import TeamsBoard from "@/components/teams/TeamsBoard";
import TeamChat from "@/components/TeamChat";
import SurveyWizard from "@/app/student-form/SurveyWizard";
import type { Inquiry, Review, Sprint, Team, User } from "@/types";

const mocks = vi.hoisted(() => ({
  updateInquiryStatus: vi.fn(), deleteInquiry: vi.fn(), bookReviewSlot: vi.fn(), cancelReviewBooking: vi.fn(), createReviewSlotsBatch: vi.fn(), deleteReviewSlot: vi.fn(), saveTeamOrganization: vi.fn(), submitStudentSurvey: vi.fn(), refresh: vi.fn(), push: vi.fn(), getList: vi.fn(), createMessage: vi.fn(),
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: mocks.refresh, push: mocks.push }) }));
vi.mock("@/lib/actions-inquiries", () => ({ updateInquiryStatus: (...args: unknown[]) => mocks.updateInquiryStatus(...args), deleteInquiry: (...args: unknown[]) => mocks.deleteInquiry(...args) }));
vi.mock("@/lib/actions-reviews", () => ({ bookReviewSlot: (...args: unknown[]) => mocks.bookReviewSlot(...args), cancelReviewBooking: (...args: unknown[]) => mocks.cancelReviewBooking(...args), createReviewSlotsBatch: (...args: unknown[]) => mocks.createReviewSlotsBatch(...args), deleteReviewSlot: (...args: unknown[]) => mocks.deleteReviewSlot(...args) }));
vi.mock("@/lib/actions-teams", () => ({ saveTeamOrganization: (...args: unknown[]) => mocks.saveTeamOrganization(...args) }));
vi.mock("@/app/student-form/actions", () => ({ submitStudentSurvey: (...args: unknown[]) => mocks.submitStudentSurvey(...args) }));
vi.mock("@/lib/pocketbase", () => ({ default: { collection: () => ({ getList: (...args: unknown[]) => mocks.getList(...args), create: (...args: unknown[]) => mocks.createMessage(...args) }) } }));

const base = { collectionId: "test", collectionName: "test", created: "2026-07-30T12:00:00.000Z", updated: "2026-07-30T12:00:00.000Z" };
const student = { ...base, id: "student-1", username: "ana", email: "ana@example.com", name: "Ana", role: "estudiante" } as User;

describe("collaboration workflows", () => {
  beforeEach(() => { Object.values(mocks).forEach((mock) => mock.mockReset()); mocks.getList.mockResolvedValue({ items: [] }); Object.defineProperty(Element.prototype, "scrollIntoView", { configurable: true, value: vi.fn() }); });

  it("resolves an inquiry and confirms the result inline", async () => {
    mocks.updateInquiryStatus.mockResolvedValue({ success: true });
    const inquiry = { ...base, id: "inquiry-1", title: "Duda", description: "¿Cómo sigo?", status: "Pendiente", author: student.id, cohort: "cohort-1" } as Inquiry;
    render(<InquiryDetailsHeader inquiry={inquiry} currentUser={student} cohortId="cohort-1" />);
    fireEvent.click(screen.getByRole("button", { name: "Marcar como resuelta" }));
    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("Consulta marcada como resuelta"));
    expect(mocks.updateInquiryStatus).toHaveBeenCalledWith("inquiry-1", "Resuelta");
  });

  it("reserves an available review slot", async () => {
    mocks.bookReviewSlot.mockResolvedValue({ success: true });
    const sprint = { ...base, id: "sprint-1", title: "Sprint 1", description: "", course: "course-1", startDate: "2026-07-01", endDate: "2026-07-31" } as Sprint;
    const review = { ...base, id: "review-1", sprint: sprint.id, student: "", teacher: "teacher-1", startTime: "2026-08-01T13:00:00.000Z", endTime: "2026-08-01T13:15:00.000Z", status: "pending" } as Review;
    render(<ReviewsManager sprint={sprint} initialReviews={[review]} currentUser={student} cohortId="cohort-1" />);
    fireEvent.click(screen.getByRole("button", { name: "Reservar" }));
    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("Turno reservado"));
    expect(mocks.bookReviewSlot).toHaveBeenCalledWith("review-1");
  });

  it("reorganizes a student and saves the explicit batch", async () => {
    mocks.saveTeamOrganization.mockResolvedValue({ success: true, message: "Organización guardada." });
    const team = { ...base, id: "team-1", name: "Equipo Norte", cohort: "cohort-1", members: [] } as Team;
    render(<TeamsBoard initialTeams={[team]} allStudents={[student]} cohortId="cohort-1" />);
    fireEvent.change(screen.getByRole("combobox", { name: "Equipo de Ana" }), { target: { value: "team-1" } });
    expect(screen.getByText("Hay cambios sin guardar")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Guardar cambios" }));
    await waitFor(() => expect(mocks.saveTeamOrganization).toHaveBeenCalledWith("cohort-1", expect.objectContaining({ "team-1": ["student-1"] })));
  });

  it("keeps mobile chat history and composer usable and sends a message", async () => {
    mocks.createMessage.mockResolvedValue({});
    render(<TeamChat teamId="team-1" currentUser={student} />);
    const chat = screen.getByRole("heading", { name: "Chat del equipo" }).closest("div")?.parentElement?.parentElement;
    expect(chat).toHaveClass("min-w-0", "overflow-hidden");
    fireEvent.change(screen.getByRole("textbox", { name: "Mensaje" }), { target: { value: "Hola equipo" } });
    fireEvent.click(screen.getByRole("button", { name: "Enviar mensaje" }));
    await waitFor(() => expect(mocks.createMessage).toHaveBeenCalledWith({ text: "Hola equipo", sender: "student-1", team: "team-1" }));
  });

  it.each(["completed", "incomplete_deliveries"] as const)("completes, reviews and confirms the %s survey branch", async (branch) => {
    mocks.submitStudentSurvey.mockResolvedValue({ success: true });
    render(<SurveyWizard sprintId="sprint-1" branch={branch} />);
    if (branch === "incomplete_deliveries") fireEvent.click(screen.getByRole("radio", { name: /Solicitar más tiempo/ }));
    const sectionCount = branch === "completed" ? 2 : 3;
    for (let step = 0; step < sectionCount; step += 1) {
      screen.getAllByRole("textbox").forEach((field, index) => fireEvent.change(field, { target: { value: `Respuesta ${index + 1}` } }));
      fireEvent.click(screen.getByRole("button", { name: "Continuar" }));
    }
    expect(screen.getByText("Revisá antes de enviar")).toBeVisible();
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: "Enviar encuesta" }));
    await waitFor(() => expect(screen.getByText("Encuesta enviada")).toBeVisible());
    const sent = mocks.submitStudentSurvey.mock.calls.at(-1)?.[0] as FormData;
    expect(sent.get("status")).toBe(branch);
  });
});
