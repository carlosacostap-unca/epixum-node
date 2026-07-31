"use client";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@/types";
import { updateUserProfile } from "@/lib/actions-users";
import { Alert, Button, Card, CardContent, CardHeader, CardTitle, Input, RadioGroup } from "@/components/ui";

export default function ProfileForm({ user }: { user: User }) {
  const router = useRouter(); const [loading, setLoading] = useState(false); const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null); const [preview, setPreview] = useState(avatarUrl(user));
  const [theme, setTheme] = useState(() => typeof window === "undefined" ? "system" : localStorage.getItem("theme") || "system");
  const submit = async (event: React.FormEvent<HTMLFormElement>) => { event.preventDefault(); setLoading(true); setFeedback(null); const form = new FormData(event.currentTarget); const birthDate = String(form.get("birthDate") || ""); const result = await updateUserProfile(user.id, { firstName: String(form.get("firstName") || ""), lastName: String(form.get("lastName") || ""), dni: String(form.get("dni") || ""), phone: String(form.get("phone") || ""), birthDate, avatar: form.get("avatar") instanceof File ? form.get("avatar") as File : undefined }); setLoading(false); setFeedback(result.success ? { ok: true, text: "Perfil actualizado correctamente." } : { ok: false, text: result.error || "No se pudo actualizar el perfil." }); if (result.success) router.refresh(); };
  const selectTheme = (value: string) => { setTheme(value); localStorage.setItem("theme", value); const resolved = value === "system" ? (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light") : value; document.documentElement.dataset.theme = resolved; };
  return <form onSubmit={submit} className="space-y-6">
    {feedback && <Alert variant={feedback.ok ? "success" : "danger"}>{feedback.text}</Alert>}
    <Card><CardHeader><CardTitle>Identidad</CardTitle></CardHeader><CardContent className="grid gap-5 sm:grid-cols-[9rem_1fr]"><div><div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-primary-soft text-3xl font-bold text-primary">{preview ? <Image unoptimized src={preview} alt="Avatar actual" width={112} height={112} className="h-full w-full object-cover" /> : initials(user)}</div></div><div className="grid gap-4 sm:grid-cols-2"><Input name="firstName" label="Nombres" defaultValue={user.firstName || user.name?.split(" ")[0]} required /><Input name="lastName" label="Apellidos" defaultValue={user.lastName || user.name?.split(" ").slice(1).join(" ")} required /><Input name="avatar" label="Avatar" type="file" accept="image/png,image/jpeg,image/webp" containerClassName="sm:col-span-2" description="PNG, JPG o WebP." onChange={(event) => { const file = event.target.files?.[0]; if (file) setPreview(URL.createObjectURL(file)); }} /></div></CardContent></Card>
    <Card><CardHeader><CardTitle>Contacto</CardTitle></CardHeader><CardContent className="grid gap-4 sm:grid-cols-2"><Input name="phone" label="Teléfono" defaultValue={user.phone} inputMode="tel" /><Input name="birthDate" label="Fecha de nacimiento" type="date" defaultValue={user.birthDate?.slice(0, 10)} /><Input name="dni" label="DNI" defaultValue={user.dni} inputMode="numeric" pattern="[0-9]*" /></CardContent></Card>
    <Card><CardHeader><CardTitle>Cuenta</CardTitle></CardHeader><CardContent className="grid gap-4 sm:grid-cols-2"><Input label="Correo" value={user.email} disabled description="Se administra mediante tu cuenta de Google." /><Input label="Rol" value={roleLabel(user.role)} disabled description="Sólo administración puede cambiarlo." /></CardContent></Card>
    <Card><CardHeader><CardTitle>Preferencias</CardTitle></CardHeader><CardContent><RadioGroup label="Tema de la interfaz" name="theme" value={theme} onChange={(event) => selectTheme(event.target.value)} options={[{ value: "light", label: "Claro" }, { value: "dark", label: "Oscuro" }, { value: "system", label: "Usar configuración del sistema" }]} /></CardContent></Card>
    <div className="flex justify-end"><Button type="submit" size="lg" loading={loading}>Guardar perfil</Button></div>
  </form>;
}
function avatarUrl(user: User) { return user.avatar ? `${process.env.NEXT_PUBLIC_POCKETBASE_URL?.replace(/\/$/, "")}/api/files/${user.collectionId}/${user.id}/${user.avatar}` : ""; }
function initials(user: User) { return (user.name || user.email).split(/\s+/).slice(0, 2).map((value) => value[0]).join("").toUpperCase(); }
function roleLabel(role: User["role"]) { return role === "admin" ? "Administrador" : role === "docente" ? "Docente" : "Estudiante"; }
