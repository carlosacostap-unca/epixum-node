import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import WeeklyClassSchedule from "./WeeklyClassSchedule";

describe("WeeklyClassSchedule", () => {
  it("muestra el inicio y los tres horarios semanales", () => {
    render(<WeeklyClassSchedule />);

    const section = screen.getByRole("region", { name: "Días y horarios" });
    expect(within(section).getByText("Viernes 7 de agosto de 2026")).toBeVisible();
    expect(within(section).getByText("15:00 horas")).toBeVisible();
    expect(within(section).getByText("Lunes")).toBeVisible();
    expect(within(section).getByText("20:00")).toBeVisible();
    expect(within(section).getByText("Miércoles")).toBeVisible();
    expect(within(section).getAllByText("16:30")).toHaveLength(2);
  });
});
