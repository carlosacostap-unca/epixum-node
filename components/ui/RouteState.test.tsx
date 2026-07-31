import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { RouteErrorState, RouteLoadingState, RouteNotFoundState } from "./RouteState";

describe("shared route states", () => {
  it("announces loading without exposing decorative skeletons", () => {
    render(<RouteLoadingState label="Cargando cohorte" />);
    expect(screen.getByLabelText("Cargando cohorte")).toHaveAttribute("aria-busy", "true");
  });

  it("offers a recoverable error action", () => {
    const reset = vi.fn(); render(<RouteErrorState reset={reset} />);
    fireEvent.click(screen.getByRole("button", { name: "Reintentar" }));
    expect(reset).toHaveBeenCalledOnce(); expect(screen.getByRole("alert")).toBeVisible();
  });

  it("provides a safe destination for missing content", () => {
    render(<RouteNotFoundState />);
    expect(screen.getByRole("heading", { name: "No encontramos esta pantalla" })).toBeVisible();
    expect(screen.getByRole("link", { name: "Ver mis cohortes" })).toHaveAttribute("href", "/cohorts");
  });
});
