"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Alert, Button } from "@/components/ui";
import pb from "@/lib/pocketbase";

export default function LoginButton() {
  const [loading, setLoading] = useState(false); const [error, setError] = useState(""); const [accessDenied, setAccessDenied] = useState(false); const router = useRouter();
  const handleLogin = async () => {
    setLoading(true); setError(""); setAccessDenied(false);
    try {
      await pb.collection("users").authWithOAuth2({ provider: "google" });
      document.cookie = pb.authStore.exportToCookie({ httpOnly: false });
      const response = await fetch("/api/auth/authorize", { method: "POST" }); const result = await response.json();
      if (!response.ok || !result.authorized) {
        pb.authStore.clear(); document.cookie = "pb_auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        if (response.status === 403) setAccessDenied(true);
        else setError(result.error || "No pudimos validar el acceso. Intentá nuevamente.");
        return;
      }
      router.push(result.destination || "/cohorts"); router.refresh();
    } catch (loginError) {
      console.error("Login failed:", loginError); setError("No se pudo iniciar sesión con Google. Intentá nuevamente.");
    } finally { setLoading(false); }
  };

  return <div className="space-y-4">
    <Button onClick={handleLogin} loading={loading} variant="secondary" size="lg" className="w-full">
      {!loading && <svg className="h-5 w-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>}
      {loading ? "Conectando con Google…" : "Continuar con Google"}
    </Button>
    {accessDenied && <div role="alert" className="rounded-lg border border-danger/30 bg-surface p-5">
      <p className="text-sm font-semibold text-danger">La cuenta de Google seleccionada no está habilitada para acceder.</p>
      <h2 className="mt-4 font-semibold">¿Necesitás acceso al módulo?</h2>
      <p className="mt-1 text-sm leading-6 text-muted">Envianos una solicitud para verificar tu inscripción y habilitar la cuenta con la que intentaste ingresar.</p>
      <Link href="/enrollment-request" className="mt-3 inline-flex font-semibold text-primary hover:text-primary-hover">Solicitar matriculación →</Link>
    </div>}
    {error && <Alert variant="danger" title="No pudimos iniciar sesión"><p>{error}</p></Alert>}
  </div>;
}
