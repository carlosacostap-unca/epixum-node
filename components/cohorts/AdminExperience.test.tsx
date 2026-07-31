import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ProfileForm from "@/components/profile/ProfileForm";
import BulkEnrollmentControl from "@/components/cohorts/BulkEnrollmentControl";
import EnrollmentRequestControls from "@/components/cohorts/EnrollmentRequestControls";
import UserRoleSelect from "@/components/UserRoleSelect";
import { assertAdminRole } from "@/lib/cohorts/domain";
import { filterAndSortAdminUsers } from "@/lib/admin-users";
import { planEnrollmentRequestResolution } from "@/lib/cohorts/enrollment-requests";
import type { CohortEnrollment, User } from "@/types";

const mocks = vi.hoisted(() => ({ updateProfile: vi.fn(), enrollAll: vi.fn(), updateRole: vi.fn(), approve: vi.fn(), reject: vi.fn(), refresh: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: mocks.refresh }) }));
vi.mock("@/lib/actions-users", () => ({ updateUserProfile: (...args: unknown[]) => mocks.updateProfile(...args) }));
vi.mock("@/lib/cohorts/actions", () => ({ enrollAllStudentsAction: (...args: unknown[]) => mocks.enrollAll(...args) }));
vi.mock("@/lib/actions", () => ({ updateUserRole: (...args: unknown[]) => mocks.updateRole(...args) }));
vi.mock("@/lib/cohorts/enrollment-request-actions", () => ({ approveEnrollmentRequestAction: (...args: unknown[]) => mocks.approve(...args), rejectEnrollmentRequestAction: (...args: unknown[]) => mocks.reject(...args) }));
const base = { collectionId: "users", collectionName: "users", created: "2026-01-01", updated: "2026-01-01" };
const ana = { ...base, id: "ana", username: "ana", name: "Ana Pérez", email: "ana@example.com", role: "estudiante" } as User;
const beto = { ...base, id: "beto", username: "beto", name: "Beto Díaz", email: "beto@example.com", role: "docente" } as User;

describe("administration and profile workflows", () => {
  beforeEach(() => { Object.values(mocks).forEach((mock) => mock.mockReset()); vi.spyOn(window, "confirm").mockReturnValue(true); });
  it("enforces administrator-only access at the domain boundary", () => { expect(() => assertAdminRole("estudiante")).toThrow(/administrador/); expect(() => assertAdminRole("docente")).toThrow(/administrador/); expect(() => assertAdminRole("admin")).not.toThrow(); });
  it("filters users by search, role, cohort and status", () => { const enrollment = { id: "e1", user: "ana", cohort: "c1", status: "active", entryType: "new" } as CohortEnrollment; const result = filterAndSortAdminUsers([beto, ana], new Map([["ana", [enrollment]]]), { search: "ana", role: "estudiante", cohort: "c1", status: "active" }); expect(result.map((user) => user.id)).toEqual(["ana"]); });
  it("previews and confirms the exact bulk population", async () => { mocks.enrollAll.mockResolvedValue({ success: true, message: "2 matrículas creadas." }); render(<BulkEnrollmentControl cohortId="c1" candidates={[ana, beto]} />); fireEvent.click(screen.getByRole("button", { name: "Revisar matriculación masiva" })); expect(screen.getByText("Vista previa (2)")).toBeVisible(); expect(screen.getByText("Ana Pérez")).toBeVisible(); fireEvent.click(screen.getByRole("button", { name: "Matricular 2" })); await waitFor(() => expect(mocks.enrollAll).toHaveBeenCalledWith("c1")); expect(await screen.findByText("2 matrículas creadas.")).toBeVisible(); });
  it("detects an identity conflict before resolution", () => { const plan = planEnrollmentRequestResolution({ emailUser: ana, dniUsers: [beto] }); expect(plan.action).toBe("conflict"); });
  it.each([["Aprobar y matricular", "approve"], ["Rechazar", "reject"]] as const)("executes request decision %s with confirmation", async (label, decision) => { mocks[decision].mockResolvedValue({ success: true, message: "Solicitud resuelta." }); render(<EnrollmentRequestControls requestId="request-1" />); fireEvent.click(screen.getByRole("button", { name: label })); await waitFor(() => expect(mocks[decision]).toHaveBeenCalledWith("request-1")); expect(screen.getByText("Solicitud resuelta.")).toBeVisible(); });
  it("updates a role and confirms the mutation", async () => { mocks.updateRole.mockResolvedValue({ success: true }); render(<UserRoleSelect user={ana} />); fireEvent.change(screen.getByRole("combobox", { name: "Rol" }), { target: { value: "docente" } }); await waitFor(() => expect(mocks.updateRole).toHaveBeenCalledWith("ana", "docente")); expect(screen.getByText("Rol actualizado.")).toBeVisible(); });
  it("saves profile sections and keeps an explicit confirmation", async () => { mocks.updateProfile.mockResolvedValue({ success: true }); render(<ProfileForm user={ana} />); fireEvent.submit(screen.getByRole("button", { name: "Guardar perfil" }).closest("form")!); await waitFor(() => expect(mocks.updateProfile).toHaveBeenCalled()); expect(screen.getByText("Perfil actualizado correctamente.")).toBeVisible(); expect(mocks.refresh).toHaveBeenCalled(); });
});
