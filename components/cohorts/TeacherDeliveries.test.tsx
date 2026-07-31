import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import TeacherDeliveries from "@/components/TeacherDeliveries";
import type { Delivery, User } from "@/types";

const students = [
  user("student-1", "Ana Entregó", "ana@example.com"),
  user("student-2", "Bruno Pendiente", "bruno@example.com"),
];
const deliveries: Delivery[] = [{
  id: "delivery-1",
  collectionId: "deliveries",
  collectionName: "deliveries",
  assignment: "assignment-1",
  student: "student-1",
  repositoryUrl: "https://github.com/epixum/ana",
  created: "2026-07-30T12:00:00.000Z",
  updated: "2026-07-30T12:00:00.000Z",
  expand: { student: students[0] },
}];

describe("teacher delivery overview", () => {
  it("shows submitted and missing students and narrows them by status", () => {
    render(<TeacherDeliveries assignmentId="assignment-1" students={students} deliveries={deliveries} />);

    const submittedMetric = screen.getByText("Entregadas").parentElement;
    const missingMetric = screen.getByText("Faltantes").parentElement;
    expect(submittedMetric).toHaveTextContent("1");
    expect(missingMetric).toHaveTextContent("1");

    const table = screen.getByRole("table", { name: "Estado de entrega de cada estudiante de la cohorte" });
    expect(within(table).getByText("Ana Entregó")).toBeInTheDocument();
    expect(within(table).getByText("Bruno Pendiente")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Estado de entrega"), { target: { value: "missing" } });
    expect(within(table).queryByText("Ana Entregó")).not.toBeInTheDocument();
    expect(within(table).getByText("Bruno Pendiente")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("1 de 2 estudiantes");
  });

  it("keeps student, status, repository, date, and access in the mobile representation", () => {
    render(<TeacherDeliveries assignmentId="assignment-1" students={students} deliveries={deliveries} />);
    const mobileList = screen.getByRole("list", { name: "Entregas en formato móvil" });
    const cards = within(mobileList).getAllByRole("listitem");

    expect(cards).toHaveLength(2);
    expect(cards[0]).toHaveTextContent("Ana Entregó");
    expect(cards[0]).toHaveTextContent("Entregada");
    expect(cards[0]).toHaveTextContent("github.com");
    expect(within(cards[0]).getByRole("link", { name: /Abrir entrega/ })).toHaveAttribute("href", deliveries[0].repositoryUrl);
    expect(cards[1]).toHaveTextContent("Bruno Pendiente");
    expect(cards[1]).toHaveTextContent("Pendiente");
    expect(cards[1]).toHaveTextContent("Sin repositorio");
  });
});

function user(id: string, name: string, email: string): User {
  return {
    id,
    name,
    email,
    username: email,
    role: "estudiante",
    collectionId: "users",
    collectionName: "users",
    created: "2026-01-01T00:00:00.000Z",
    updated: "2026-01-01T00:00:00.000Z",
  };
}
