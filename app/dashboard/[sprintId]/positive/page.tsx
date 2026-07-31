import { LegacyDashboardRedirect } from "../LegacyDashboardRedirect";
import type { LegacySearchParams } from "@/lib/cohorts/route-compatibility";

export default function LegacyPositivePage(props: { params: Promise<{ sprintId: string }>; searchParams: Promise<LegacySearchParams> }) {
  return LegacyDashboardRedirect({ ...props, view: "positive" });
}
