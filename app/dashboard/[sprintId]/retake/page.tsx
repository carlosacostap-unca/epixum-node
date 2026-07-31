import { LegacyDashboardRedirect } from "../LegacyDashboardRedirect";
import type { LegacySearchParams } from "@/lib/cohorts/route-compatibility";

export default function LegacyRetakePage(props: { params: Promise<{ sprintId: string }>; searchParams: Promise<LegacySearchParams> }) {
  return LegacyDashboardRedirect({ ...props, view: "retake" });
}
