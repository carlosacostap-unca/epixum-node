import Image from "next/image";
import LoginButton from "@/components/LoginButton";

export default function LoginPage() {
  return <main className="grid min-h-screen bg-background lg:grid-cols-[1.1fr_0.9fr]">
    <section className="relative hidden overflow-hidden bg-gradient-to-br from-blue-800 via-indigo-800 to-violet-900 p-12 text-white lg:flex lg:flex-col lg:justify-between">
      <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" aria-hidden="true" />
      <div className="relative flex items-center gap-3 text-xl font-bold"><Image src="/epixum-logo.png" alt="" width={44} height={44} className="h-11 w-11 rounded-lg bg-white/95 object-contain p-1" />Epixum</div>
      <div className="relative max-w-2xl">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-200">Diplomatura en Desarrollo Web Fullstack con JavaScript</p>
        <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 font-mono text-sm font-semibold text-blue-100">
          <span className="h-2 w-2 rounded-full bg-emerald-300" aria-hidden="true" />
          Módulo Back End
        </div>
        <h2 className="mt-5 text-5xl font-bold leading-[1.08]">Desarrollo Back End con Node.js</h2>
        <p className="mt-5 max-w-xl text-lg leading-8 text-blue-100">Accedé a las clases, trabajos prácticos, consultas, equipos y revisiones de este módulo.</p>
      </div>
      <p className="relative font-mono text-sm text-blue-200">Node.js · APIs · Bases de datos</p>
    </section>
    <section className="flex items-center justify-center px-5 py-12 sm:px-10">
      <div className="w-full max-w-md">
        <div className="mb-10 flex items-center gap-3 lg:hidden"><Image src="/epixum-logo.png" alt="" width={40} height={40} className="h-10 w-10 object-contain" /><span className="text-xl font-bold">Epixum</span></div>
        <p className="text-sm font-bold uppercase tracking-[0.14em] text-primary">Acceso al módulo</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">Ingresá a Back End con Node.js</h1>
        <p className="mt-3 leading-7 text-muted">Usá el correo de Google registrado para cursar este módulo de la Diplomatura en Desarrollo Web Fullstack con JavaScript.</p>
        <div className="mt-8"><LoginButton /></div>
        <p className="mt-6 text-xs leading-5 text-muted">Al continuar, Google compartirá únicamente los datos necesarios para identificar tu cuenta.</p>
      </div>
    </section>
  </main>;
}
