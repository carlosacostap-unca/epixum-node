import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import LoginButton from "@/components/LoginButton";

const mocks = vi.hoisted(() => ({
  authWithOAuth2: vi.fn(),
  clear: vi.fn(),
  exportToCookie: vi.fn(() => "pb_auth=test"),
  fetch: vi.fn(),
  push: vi.fn(),
  refresh: vi.fn(),
}));

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: mocks.push, refresh: mocks.refresh }) }));
vi.mock("@/lib/pocketbase", () => ({
  default: {
    authStore: { clear: mocks.clear, exportToCookie: mocks.exportToCookie },
    collection: () => ({ authWithOAuth2: mocks.authWithOAuth2 }),
  },
}));

describe("LoginButton", () => {
  beforeEach(() => {
    Object.values(mocks).forEach(mock => mock.mockClear());
    mocks.authWithOAuth2.mockResolvedValue({});
    vi.stubGlobal("fetch", mocks.fetch);
  });

  it("does not offer an enrollment request before an access attempt", () => {
    render(<LoginButton />);

    expect(screen.queryByText("¿Necesitás acceso al módulo?")).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Solicitar matriculación →" })).not.toBeInTheDocument();
  });

  it("offers an enrollment request when the Google account is not authorized", async () => {
    mocks.fetch.mockResolvedValue({
      ok: false,
      status: 403,
      json: async () => ({ authorized: false, error: "La cuenta no está habilitada." }),
    });
    render(<LoginButton />);

    fireEvent.click(screen.getByRole("button", { name: "Continuar con Google" }));

    expect(await screen.findByText("¿Necesitás acceso al módulo?")).toBeVisible();
    expect(screen.getByText("La cuenta de Google seleccionada no está habilitada para acceder.")).toBeVisible();
    expect(screen.getByRole("link", { name: "Solicitar matriculación →" })).toHaveAttribute("href", "/enrollment-request");
  });

  it("keeps the enrollment request hidden for a technical validation error", async () => {
    mocks.fetch.mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ authorized: false, error: "No se pudo validar el acceso." }),
    });
    render(<LoginButton />);

    fireEvent.click(screen.getByRole("button", { name: "Continuar con Google" }));

    expect(await screen.findByText("No se pudo validar el acceso.")).toBeVisible();
    expect(screen.queryByText("¿Necesitás acceso al módulo?")).not.toBeInTheDocument();
  });
});
