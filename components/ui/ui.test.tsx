import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { Alert, Badge, Button, Checkbox, Dialog, IconButton, Input, Menu, MenuItem, RadioGroup, Tabs } from "@/components/ui";

describe("UI primitives", () => {
  it("exposes accessible names and loading state for actions", () => {
    render(<><Button loading>Guardar</Button><IconButton label="Cerrar panel">×</IconButton></>);
    expect(screen.getByRole("button", { name: "Guardar" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Guardar" })).toHaveAttribute("aria-busy", "true");
    expect(screen.getByRole("button", { name: "Cerrar panel" })).toBeVisible();
  });

  it("renders textual status variants in addition to color", () => {
    render(<><Badge variant="success">Completado</Badge><Alert variant="danger" title="Error">No se pudo guardar</Alert></>);
    expect(screen.getByText("Completado")).toHaveClass("text-success");
    expect(screen.getByRole("alert")).toHaveTextContent("ErrorNo se pudo guardar");
  });

  it("associates form labels, descriptions, and errors", () => {
    render(<><Input label="Correo" description="Usá tu correo de Google" error="Correo inválido" /><Checkbox label="Acepto las condiciones" /><RadioGroup label="Modalidad" options={[{ value: "remote", label: "Remota" }, { value: "onsite", label: "Presencial" }]} /></>);
    const input = screen.getByRole("textbox", { name: "Correo" });
    expect(input).toHaveAccessibleDescription("Usá tu correo de Google Correo inválido");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("checkbox", { name: "Acepto las condiciones" })).toBeVisible();
    expect(screen.getByRole("group", { name: "Modalidad" })).toBeVisible();
  });

  it("supports arrow-key tab navigation", () => {
    render(<Tabs items={[{ id: "summary", label: "Resumen", content: "Contenido resumen" }, { id: "details", label: "Detalle", content: "Contenido detalle" }]} />);
    const summary = screen.getByRole("tab", { name: "Resumen" });
    fireEvent.keyDown(summary, { key: "ArrowRight" });
    expect(screen.getByRole("tab", { name: "Detalle" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Contenido detalle");
  });

  it("dismisses menus with Escape and restores trigger focus", () => {
    render(<Menu label="Cuenta" trigger={<span>Usuario</span>}><MenuItem>Perfil</MenuItem></Menu>);
    const trigger = screen.getByRole("button", { name: "Cuenta" });
    fireEvent.click(trigger);
    expect(screen.getByRole("menu")).toBeVisible();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("can open a menu above a trigger placed at the bottom of the viewport", () => {
    render(<Menu label="Cuenta inferior" side="top" trigger={<span>Usuario</span>}><MenuItem>Perfil</MenuItem></Menu>);
    fireEvent.click(screen.getByRole("button", { name: "Cuenta inferior" }));
    expect(screen.getByRole("menu", { name: "Cuenta inferior" })).toHaveAttribute("data-side", "top");
    expect(screen.getByRole("menu", { name: "Cuenta inferior" })).toHaveClass("bottom-full", "mb-2");
  });

  it("closes modal dialogs through the named close action", () => {
    const changed = vi.fn();
    render(<Dialog open onOpenChange={changed} title="Editar perfil">Formulario</Dialog>);
    expect(screen.getByRole("dialog", { name: "Editar perfil" })).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Cerrar" }));
    expect(changed).toHaveBeenCalledWith(false);
  });

  it("supports controlled dialog lifecycle", () => {
    function Example() { const [open, setOpen] = useState(true); return <Dialog open={open} onOpenChange={setOpen} title="Confirmación">Contenido</Dialog>; }
    render(<Example />);
    fireEvent.click(screen.getByRole("button", { name: "Cerrar" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
