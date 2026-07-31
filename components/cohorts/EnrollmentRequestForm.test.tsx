import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import EnrollmentRequestForm from "./EnrollmentRequestForm";

vi.mock("@/lib/cohorts/enrollment-request-actions", () => ({
  createEnrollmentRequestAction: vi.fn(async () => ({
    success: true,
    message: "La solicitud quedó pendiente de revisión.",
  })),
}));

describe("EnrollmentRequestForm", () => {
  it("replaces the form with a clear confirmation and next steps after submission", async () => {
    render(<EnrollmentRequestForm cohorts={[{
      id: "cohort-1",
      name: "Desarrollo web 2026",
      slug: "desarrollo-web-2026",
      mode: "weekly",
      status: "active",
      created: "2026-01-01",
      updated: "2026-01-01",
      collectionId: "cohorts",
      collectionName: "cohorts",
    }]} />);

    const form = screen.getByRole("button", { name: "Enviar solicitud" }).closest("form");
    expect(form).not.toBeNull();
    fireEvent.submit(form!);

    await waitFor(() => expect(screen.getByRole("heading", { name: "Recibimos tu solicitud" })).toBeVisible());
    expect(screen.getByText("La solicitud quedó pendiente de revisión.")).toBeVisible();
    expect(screen.getByText(/equipo docente verificará tus datos/i)).toBeVisible();
    expect(screen.getByRole("link", { name: "Volver al ingreso" })).toHaveAttribute("href", "/login");
    expect(screen.queryByRole("button", { name: "Enviar solicitud" })).not.toBeInTheDocument();
  });
});
