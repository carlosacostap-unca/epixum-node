import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import axe from "axe-core";
import { describe, expect, it, vi } from "vitest";
import ContentBlockRenderer from "./ContentBlockRenderer";
import ContentPreview from "./ContentPreview";
import ContentSectionManager from "./ContentSectionManager";
import type { ContentSection } from "@/types";
import type { PublicContentRevision } from "@/lib/content/projection";

vi.mock("@/lib/content/actions", () => ({
  createContentSectionAction: vi.fn(), duplicateContentSectionAction: vi.fn(), reorderContentSectionsAction: vi.fn(), setContentSectionStateAction: vi.fn(),
}));

const section: ContentSection = { id: "section00000001", cohort: "cohort00000001", week: "week000000001", position: 1, title: "Introducción", status: "draft", currentRevision: "revision0000001", created: "", updated: "", collectionId: "content_sections", collectionName: "content_sections" };
const revision: PublicContentRevision = { revisionId: "revision0000001", revisionNumber: 1, requirementsRevision: "r1234567", activities: [], blocks: [
  { key: "intro_text", type: "rich_text", content: { type: "doc", content: [{ type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Hola Node.js" }] }, { type: "paragraph", content: [{ type: "text", text: "Contenido adaptable." }] }] } },
  { key: "sample_code", type: "code", title: "Ejemplo", language: "javascript", code: "console.log('hola')" },
] };

describe("weekly content authoring UI", () => {
  it("offers drag, keyboard movement and contextual publication actions", () => {
    render(<ContentSectionManager cohortId={section.cohort} weekId={section.week} sections={[section]} />);
    expect(screen.getByRole("button", { name: /Arrastrar sección 1/ })).toBeVisible();
    expect(screen.getByRole("button", { name: /Subir Introducción/ })).toBeDisabled();
    expect(screen.getByRole("link", { name: "Editar" })).toHaveAttribute("href", expect.stringContaining("/edit"));
    expect(screen.getByRole("button", { name: "Publicar" })).toBeVisible();
  });

  it("renders preview with persistent explanation and responsive-safe content", async () => {
    const revisionWithImage: PublicContentRevision = { ...revision, blocks: [...revision.blocks, { key: "terminal_image", type: "image", source: { assetId: "asset000000001" }, alt: "Anatomía de una terminal" }] };
    const { container } = render(<ContentPreview cohortId={section.cohort} weekId={section.week} section={section} revision={revisionWithImage} assetUrls={{ asset000000001: "https://storage.example/terminal.png?token=signed" }} backHref="/edit" />);
    expect(screen.getByText("Vista previa como alumno")).toBeVisible();
    expect(screen.getByRole("heading", { name: "Hola Node.js" })).toBeVisible();
    expect(container.querySelector("[data-block-key='intro_text']")).toHaveClass("scroll-mt-28");
    await waitFor(() => expect(container.querySelector("pre code")).toHaveTextContent("console.log('hola')"));
    expect(container.querySelector("pre")).toHaveClass("overflow-x-auto");
    expect(screen.getByRole("img", { name: "Anatomía de una terminal" })).toHaveAttribute("src", "https://storage.example/terminal.png?token=signed");
    const results = await axe.run(container, { resultTypes: ["violations"] });
    expect(results.violations.filter((item) => item.impact === "serious" || item.impact === "critical")).toEqual([]);
  });

  it("provides an accessible copy action for code", async () => {
    Object.assign(navigator, { clipboard: { writeText: vi.fn().mockResolvedValue(undefined) } });
    render(<ContentBlockRenderer blocks={revision.blocks} />);
    fireEvent.click(screen.getByRole("button", { name: "Copiar" }));
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("console.log('hola')");
  });

  it("renders responsive terminal and command references with scoped copy actions", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    const technicalBlocks: PublicContentRevision["blocks"] = [
      { key: "terminal_demo", type: "terminal", title: "Terminal · ejemplo", rows: [{ key: "terminal_prompt", kind: "prompt", label: "Prompt", value: "PS C:\\Curso>" }, { key: "terminal_command", kind: "command", label: "Comando", value: "echo Hola" }, { key: "terminal_response", kind: "response", label: "Respuesta", value: "Hola" }] },
      { key: "command_reference", type: "command_reference", title: "Comandos esenciales", items: [{ key: "command_pwd", command: "pwd", purpose: "Muestra en qué carpeta estás.", tryIt: "Confirmá tu ubicación." }] },
    ];
    const { container } = render(<ContentBlockRenderer blocks={technicalBlocks} />);
    expect(screen.getByRole("group", { name: "Terminal · ejemplo" })).toBeVisible();
    expect(screen.getByText("PS C:\\Curso>")).toBeVisible();
    expect(screen.getByRole("list", { name: "Comandos esenciales" })).toBeVisible();
    const copy = screen.getByRole("button", { name: "Copiar comando pwd" });
    fireEvent.click(copy);
    expect(writeText).toHaveBeenCalledWith("pwd");
    expect(container.querySelector('[role="listitem"]')).toHaveClass("grid");
    expect(container.querySelector('[role="listitem"]')).not.toHaveClass("min-w");
    const results = await axe.run(container, { resultTypes: ["violations"] });
    expect(results.violations.filter((item) => item.impact === "serious" || item.impact === "critical")).toEqual([]);
  });

  it("keeps generator markers visible and copies only complete commands", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    const generator: PublicContentRevision["blocks"] = [{
      key: "git_config_generator", type: "generator", title: "Generá tu configuración", description: "Los datos permanecen en el navegador.",
      variables: [
        { key: "student_name", label: "Nombre real", inputType: "text", required: true },
        { key: "student_email", label: "Correo de commits", inputType: "email", required: true },
      ],
      template: 'git config --global user.name "{{student_name}}"\ngit config --global user.email "{{student_email}}"', language: "bash",
    }];
    const { container } = render(<ContentBlockRenderer blocks={generator} />);
    const copy = screen.getByRole("button", { name: "Copiar comandos" });
    expect(copy).toBeDisabled();
    expect(container.querySelector("pre")).toHaveTextContent("{{student_name}}");

    fireEvent.change(screen.getByLabelText(/^Nombre real/), { target: { value: "Ana Pérez" } });
    fireEvent.change(screen.getByLabelText(/^Correo de commits/), { target: { value: "ana@example.com" } });
    expect(copy).toBeEnabled();
    expect(container.querySelector("pre")).not.toHaveTextContent("{{student_name}}");
    fireEvent.click(copy);
    expect(writeText).toHaveBeenCalledWith('git config --global user.name "Ana Pérez"\ngit config --global user.email "ana@example.com"');
    await waitFor(() => expect(screen.getByRole("button", { name: "Copiados" })).toBeVisible());
  });

  it("offers a safe GitHub profile check only for valid usernames", async () => {
    const validator: PublicContentRevision["blocks"] = [{
      key: "github_username", type: "validator", activityKey: "github_username", required: true,
      label: "Nombre de usuario de GitHub", placeholder: "tu-usuario", helpText: "No ingreses el correo ni la contraseña.", presentation: "github_profile",
    }];
    const { container } = render(<ContentBlockRenderer blocks={validator} learningContext={{ cohortId: "cohort00000001", weekId: "week000000001", sectionId: "section00000001", revisionId: "revision0000001" }} />);
    const input = screen.getByLabelText("Nombre de usuario de GitHub");
    expect(screen.queryByRole("link", { name: "Abrir perfil en GitHub" })).not.toBeInTheDocument();

    fireEvent.change(input, { target: { value: "usuario--invalido" } });
    expect(screen.queryByRole("link", { name: "Abrir perfil en GitHub" })).not.toBeInTheDocument();
    expect(screen.getByText(/se habilitará cuando el formato sea válido/)).toBeVisible();

    fireEvent.change(input, { target: { value: "ana-dev" } });
    const profile = screen.getByRole("link", { name: "Abrir perfil en GitHub" });
    expect(profile).toHaveAttribute("href", "https://github.com/ana-dev");
    expect(profile).toHaveAttribute("target", "_blank");
    expect(profile).toHaveAttribute("rel", "noreferrer");
    expect(screen.getByText(/confirmá que muestra tu propia cuenta/)).toBeVisible();
    expect(container.querySelector("code")).toHaveClass("break-all");
    const results = await axe.run(container, { resultTypes: ["violations"] });
    expect(results.violations.filter((item) => item.impact === "serious" || item.impact === "critical")).toEqual([]);
  });
});
