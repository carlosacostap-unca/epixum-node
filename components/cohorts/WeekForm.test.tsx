import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { Week } from "@/types";
import WeekForm from "./WeekForm";

const action = vi.fn(async () => ({ success: true as const, message: "Guardado" }));

describe("WeekForm", () => {
  it("permite crear la Semana 0 desde el control numérico", () => {
    render(<WeekForm action={action} />);

    expect(screen.getByRole("spinbutton", { name: /número/i })).toHaveAttribute("min", "0");
  });

  it("conserva el número cero al editar una semana", () => {
    const week = { number: 0, title: "Semana 0", description: "Preparación" } as Week;
    render(<WeekForm action={action} week={week} />);

    expect(screen.getByRole("spinbutton", { name: /número/i })).toHaveValue(0);
    expect(screen.getByRole("textbox", { name: /título/i })).toHaveValue("Semana 0");
  });
});
