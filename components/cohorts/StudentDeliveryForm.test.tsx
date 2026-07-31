import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import StudentDelivery from "@/components/StudentDelivery";
import type { Delivery } from "@/types";

const mocks = vi.hoisted(() => ({
  createDelivery: vi.fn(),
  updateDelivery: vi.fn(),
  refresh: vi.fn(),
}));

vi.mock("@/lib/actions", () => ({
  createDelivery: (...args: unknown[]) => mocks.createDelivery(...args),
  updateDelivery: (...args: unknown[]) => mocks.updateDelivery(...args),
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: mocks.refresh }) }));

const delivery: Delivery = {
  id: "delivery-1",
  collectionId: "deliveries",
  collectionName: "deliveries",
  assignment: "assignment-1",
  student: "student-1",
  repositoryUrl: "https://github.com/epixum/initial",
  created: "2026-07-30T12:00:00.000Z",
  updated: "2026-07-30T12:00:00.000Z",
};

describe("student delivery form", () => {
  beforeEach(() => {
    mocks.createDelivery.mockReset();
    mocks.updateDelivery.mockReset();
    mocks.refresh.mockReset();
  });

  it("presents a pending delivery with one next action", () => {
    render(<StudentDelivery assignmentId="assignment-1" delivery={null} />);

    expect(screen.getByRole("status")).toHaveTextContent("Pendiente");
    expect(screen.getByText("Todavía no realizaste esta entrega")).toBeVisible();
    expect(screen.getAllByRole("button")).toHaveLength(1);
    expect(screen.getByRole("button", { name: "Realizar entrega" })).toBeVisible();
  });

  it("presents a submitted delivery with its repository and update action", () => {
    render(<StudentDelivery assignmentId="assignment-1" delivery={delivery} />);

    expect(screen.getByRole("status")).toHaveTextContent("Entregada");
    expect(screen.getByRole("link", { name: /github.com\/epixum\/initial/ })).toHaveAttribute("href", delivery.repositoryUrl);
    expect(screen.getByRole("button", { name: "Actualizar entrega" })).toBeVisible();
  });

  it("shows an inline URL error before calling the server action", () => {
    render(<StudentDelivery assignmentId="assignment-1" delivery={null} />);
    fireEvent.click(screen.getByRole("button", { name: "Realizar entrega" }));
    const input = screen.getByRole("textbox", { name: /URL del repositorio/ });
    fireEvent.change(input, { target: { value: "github.com/sin-protocolo" } });
    fireEvent.submit(input.closest("form")!);

    expect(screen.getByRole("alert")).toHaveTextContent("Ingresá una URL completa");
    expect(input).toHaveValue("github.com/sin-protocolo");
    expect(mocks.createDelivery).not.toHaveBeenCalled();
  });

  it("preserves the repository URL after a recoverable server error", async () => {
    mocks.createDelivery.mockResolvedValue({ success: false, error: "No pudimos enviar la entrega. Intentá nuevamente." });
    render(<StudentDelivery assignmentId="assignment-1" delivery={null} />);
    fireEvent.click(screen.getByRole("button", { name: "Realizar entrega" }));
    const input = screen.getByRole("textbox", { name: /URL del repositorio/ });
    fireEvent.change(input, { target: { value: "https://github.com/epixum/proyecto" } });
    fireEvent.submit(input.closest("form")!);

    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("No pudimos enviar la entrega"));
    expect(input).toHaveValue("https://github.com/epixum/proyecto");
    expect(screen.getByRole("button", { name: "Confirmar entrega" })).toBeEnabled();
  });

  it("confirms a successful new delivery and refreshes its state", async () => {
    mocks.createDelivery.mockResolvedValue({ success: true, message: "Entrega enviada correctamente." });
    render(<StudentDelivery assignmentId="assignment-1" delivery={null} />);
    fireEvent.click(screen.getByRole("button", { name: "Realizar entrega" }));
    const input = screen.getByRole("textbox", { name: /URL del repositorio/ });
    fireEvent.change(input, { target: { value: "https://github.com/epixum/proyecto" } });
    fireEvent.submit(input.closest("form")!);

    await waitFor(() => expect(screen.getByText("Entrega enviada correctamente.")).toBeVisible());
    expect(mocks.createDelivery).toHaveBeenCalledOnce();
    expect(mocks.refresh).toHaveBeenCalledOnce();
  });

  it("confirms a successful delivery update", async () => {
    mocks.updateDelivery.mockResolvedValue({ success: true, message: "Entrega actualizada correctamente." });
    render(<StudentDelivery assignmentId="assignment-1" delivery={delivery} />);
    fireEvent.click(screen.getByRole("button", { name: "Actualizar entrega" }));
    const input = screen.getByRole("textbox", { name: /URL del repositorio/ });
    fireEvent.change(input, { target: { value: "https://gitlab.com/epixum/actualizado" } });
    fireEvent.submit(input.closest("form")!);

    await waitFor(() => expect(screen.getByText("Entrega actualizada correctamente.")).toBeVisible());
    expect(mocks.updateDelivery).toHaveBeenCalledWith("delivery-1", expect.any(FormData));
    expect(mocks.refresh).toHaveBeenCalledOnce();
  });
});
