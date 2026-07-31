import type { ReactNode } from "react";
import { getAccessibleCohorts } from "@/lib/cohorts/access";
import { getCurrentUser } from "@/lib/pocketbase-server";
import AppShellClient from "./AppShellClient";

export default async function AppShell({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  if (!user) return children;
  const cohorts = await getAccessibleCohorts(user);
  return <AppShellClient user={user} cohorts={cohorts}>{children}</AppShellClient>;
}
