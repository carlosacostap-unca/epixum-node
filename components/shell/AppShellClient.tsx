"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import pb from "@/lib/pocketbase";
import { cn } from "@/lib/cn";
import { getBreadcrumbs, getCohortDestination, getNavigationItems, isNavigationItemActive, type NavigationIcon, type NavigationItem } from "@/lib/navigation";
import type { Cohort, User } from "@/types";
import { Badge, Button, Menu, MenuItem, ToastProvider } from "@/components/ui";

const publicPaths = new Set(["/login", "/enrollment-request"]);

export default function AppShellClient({ user, cohorts, children }: { user: User; cohorts: Cohort[]; children: ReactNode }) {
  const pathname = usePathname(); const router = useRouter(); const [mobileOpen, setMobileOpen] = useState(false);
  const cohortId = pathname.match(/^\/cohorts\/([^/]+)/)?.[1];
  const hasSingleStudentCohort = user.role === "estudiante" && cohorts.length === 1;
  const canSwitchCohorts = user.role !== "estudiante" || cohorts.length > 1;
  const activeCohort = cohorts.find(cohort => cohort.id === cohortId) || (hasSingleStudentCohort ? cohorts[0] : null);
  const navigation = useMemo(() => getNavigationItems({ role: user.role, cohort: activeCohort, showCohorts: canSwitchCohorts }), [user.role, activeCohort, canSwitchCohorts]);
  const breadcrumbs = getBreadcrumbs(pathname, activeCohort?.name);
  const mobileItems = navigation.filter(item => item.mobile).slice(0, 5);

  useEffect(() => {
    const media = matchMedia("(prefers-color-scheme: dark)");
    const applySystemTheme = () => { if ((localStorage.getItem("epixum-theme") || "system") === "system") document.documentElement.dataset.theme = media.matches ? "dark" : "light"; };
    media.addEventListener("change", applySystemTheme);
    return () => media.removeEventListener("change", applySystemTheme);
  }, []);

  const logout = () => { pb.authStore.clear(); document.cookie = "pb_auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"; router.push("/login"); router.refresh(); };
  const selectTheme = (theme: "light" | "dark" | "system") => {
    localStorage.setItem("epixum-theme", theme);
    const resolved = theme === "system" ? (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light") : theme;
    document.documentElement.dataset.theme = resolved;
  };

  if (publicPaths.has(pathname)) return <ToastProvider>{children}</ToastProvider>;

  return <ToastProvider>
    <div className="min-h-screen bg-background lg:pl-72">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 flex-col border-r bg-surface lg:flex">
        <Brand />
        {canSwitchCohorts && <div className="border-b p-4"><CohortSelect cohorts={cohorts} activeId={activeCohort?.id} onChange={id => router.push(getCohortDestination({ id }))} /></div>}
        <nav aria-label="Navegación principal" className="flex-1 space-y-1 overflow-y-auto p-3">{navigation.map(item => <NavItem key={item.id} item={item} pathname={pathname} />)}</nav>
        <div className="border-t p-4"><IdentityMenu user={user} logout={logout} selectTheme={selectTheme} /></div>
      </aside>

      <header className="sticky top-0 z-30 flex min-h-16 items-center gap-3 border-b bg-surface/95 px-4 backdrop-blur lg:px-8">
        <Button variant="ghost" size="sm" className="aspect-square px-0 lg:hidden" aria-label="Abrir navegación" aria-expanded={mobileOpen} onClick={() => setMobileOpen(true)}><Icon name="content" /></Button>
        <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{activeCohort?.name || "Epixum"}</p><p className="truncate text-xs text-muted">{roleLabel(user.role)}</p></div>
        <div className="lg:hidden"><IdentityMenu user={user} logout={logout} selectTheme={selectTheme} compact /></div>
      </header>

      {mobileOpen && <div className="fixed inset-0 z-50 lg:hidden"><button className="absolute inset-0 bg-zinc-950/60" aria-label="Cerrar navegación" onClick={() => setMobileOpen(false)} /><aside className="relative flex h-full w-[min(20rem,88vw)] flex-col border-r bg-surface shadow-md"><div className="flex items-center justify-between border-b"><Brand /><Button variant="ghost" aria-label="Cerrar navegación" onClick={() => setMobileOpen(false)}>×</Button></div>{canSwitchCohorts && <div className="border-b p-4"><CohortSelect cohorts={cohorts} activeId={activeCohort?.id} onChange={id => { setMobileOpen(false); router.push(getCohortDestination({ id })); }} /></div>}<nav aria-label="Navegación móvil" className="flex-1 space-y-1 overflow-y-auto p-3" onClick={() => setMobileOpen(false)}>{navigation.map(item => <NavItem key={item.id} item={item} pathname={pathname} />)}</nav></aside></div>}

      <div className="mx-auto w-full max-w-[var(--content-dashboard)] px-4 pt-4 lg:px-8">
        <nav aria-label="Migas de pan" className="flex flex-wrap items-center gap-2 text-xs text-muted">{breadcrumbs.map((crumb, index) => <span key={`${crumb.label}-${index}`} className="flex items-center gap-2">{index > 0 && <span aria-hidden="true">/</span>}{crumb.href ? <Link className="hover:text-foreground" href={crumb.href}>{crumb.label}</Link> : <span aria-current="page" className="text-foreground">{crumb.label}</span>}</span>)}</nav>
      </div>
      <div className="pb-24 lg:pb-0">{children}</div>

      <nav aria-label="Navegación principal móvil" className="fixed inset-x-0 bottom-0 z-30 grid border-t bg-surface/95 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden" style={{ gridTemplateColumns: `repeat(${Math.max(mobileItems.length, 1)}, minmax(0, 1fr))` }}>{mobileItems.map(item => <Link key={item.id} href={item.href} aria-current={isNavigationItemActive(item, pathname) ? "page" : undefined} className={cn("flex min-h-16 flex-col items-center justify-center gap-1 rounded-sm px-1 text-[11px] font-medium text-muted", isNavigationItemActive(item, pathname) && "text-primary")}><Icon name={item.icon} /><span className="max-w-full truncate">{item.label}</span></Link>)}</nav>
    </div>
  </ToastProvider>;
}

function Brand() { return <Link href="/" className="flex min-h-16 items-center gap-3 px-5 font-bold"><Image src="/epixum-logo.png" alt="" width={34} height={34} className="h-9 w-9 object-contain" /><span>Epixum</span></Link>; }
function NavItem({ item, pathname }: { item: NavigationItem; pathname: string }) { const active = isNavigationItemActive(item, pathname); return <Link href={item.href} aria-current={active ? "page" : undefined} className={cn("flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-medium text-muted hover:bg-surface-muted hover:text-foreground", active && "bg-primary-soft text-primary")}><Icon name={item.icon} /><span>{item.label}</span></Link>; }
function CohortSelect({ cohorts, activeId, onChange }: { cohorts: Cohort[]; activeId?: string; onChange: (id: string) => void }) { return <label className="block text-xs font-semibold text-muted"><span className="mb-1.5 block">Cohorte activa</span><select value={activeId || ""} onChange={event => event.target.value && onChange(event.target.value)} className="min-h-10 w-full rounded-md border bg-surface px-3 text-sm text-foreground"><option value="" disabled>Seleccionar cohorte</option>{cohorts.map(cohort => <option key={cohort.id} value={cohort.id}>{cohort.name}</option>)}</select></label>; }
function IdentityMenu({ user, logout, selectTheme, compact = false }: { user: User; logout: () => void; selectTheme: (theme: "light" | "dark" | "system") => void; compact?: boolean }) { const initials = (user.name || user.email || "U").split(/\s+/).slice(0, 2).map(value => value[0]).join("").toUpperCase(); return <Menu label="Cuenta y preferencias" align={compact ? "end" : "start"} side={compact ? "bottom" : "top"} trigger={<span className={cn("flex items-center gap-3 rounded-md p-1.5 hover:bg-surface-muted", compact && "p-1")}><span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-primary-soft text-xs font-bold text-primary">{user.avatar ? <Image unoptimized src={`${process.env.NEXT_PUBLIC_POCKETBASE_URL}/api/files/_pb_users_auth_/${user.id}/${user.avatar}`} alt="" width={36} height={36} className="h-full w-full object-cover" /> : initials}</span>{!compact && <span className="min-w-0 text-left"><span className="block truncate text-sm font-semibold">{user.name || user.email}</span><span className="block text-xs text-muted">{roleLabel(user.role)}</span></span>}</span>}><div className="border-b px-3 py-2"><p className="truncate text-sm font-semibold">{user.name || user.email}</p><Badge className="mt-1">{roleLabel(user.role)}</Badge></div><MenuItem onClick={() => location.assign("/profile")}>Mi perfil</MenuItem><div className="border-y px-3 py-2"><p className="mb-2 text-xs font-semibold text-muted">Tema</p><div className="flex gap-1">{(["light", "dark", "system"] as const).map(theme => <button key={theme} type="button" className="rounded-sm border px-2 py-1 text-xs hover:bg-surface-muted" onClick={event => { event.stopPropagation(); selectTheme(theme); }}>{theme === "light" ? "Claro" : theme === "dark" ? "Oscuro" : "Sistema"}</button>)}</div></div><MenuItem className="text-danger" onClick={logout}>Cerrar sesión</MenuItem></Menu>; }
function roleLabel(role: User["role"]) { return role === "admin" ? "Administrador" : role === "docente" ? "Docente" : "Estudiante"; }
function Icon({ name }: { name: NavigationIcon }) { const paths: Record<NavigationIcon, string> = { home: "M3 11.5 12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z", cohorts: "M4 5h16v14H4z M8 9h8 M8 13h5", content: "M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z M8 4v13a3 3 0 0 0-3-3", inquiries: "M4 5h16v12H8l-4 4z", dashboard: "M4 19V9h4v10z M10 19V4h4v15z M16 19v-7h4v7z", teams: "M8 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M16 11a3 3 0 1 0 0-6 M2 21v-2a6 6 0 0 1 12 0v2 M14 15a5 5 0 0 1 8 4v2", reviews: "M5 4v3 M19 4v3 M4 9h16 M5 6h14a1 1 0 0 1 1 1v13H4V7a1 1 0 0 1 1-1z", survey: "M7 4h10 M7 8h10 M7 12h6 M5 18l2 2 4-5", requests: "M12 3v12 M7 10l5 5 5-5 M5 21h14", users: "M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M3 21a6 6 0 0 1 12 0 M17 8h4 M19 6v4", settings: "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z M12 2v2 M12 20v2 M4.9 4.9l1.4 1.4 M17.7 17.7l1.4 1.4 M2 12h2 M20 12h2 M4.9 19.1l1.4-1.4 M17.7 6.3l1.4-1.4" }; return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5 shrink-0"><path strokeLinecap="round" strokeLinejoin="round" d={paths[name]} /></svg>; }
