import { createServerClient } from "@/lib/pocketbase-server";
import ProfileForm from "@/components/profile/ProfileForm";
import type { User } from "@/types";
import { notFound, redirect } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";

export const dynamic = "force-dynamic";
export default async function ProfilePage() {
  const pb = await createServerClient(); const currentUser = pb.authStore.model; if (!currentUser) redirect("/login");
  const user = await pb.collection("users").getOne<User>(currentUser.id).catch(() => null); if (!user) notFound();
  return <div className="mx-auto max-w-4xl space-y-8"><PageHeader eyebrow="Cuenta personal" title="Mi perfil" description="Administrá tu identidad, datos de contacto y preferencias de interfaz." /><ProfileForm user={user} /></div>;
}
