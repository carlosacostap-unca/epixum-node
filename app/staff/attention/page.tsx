import TeacherAttentionWorkspace from "@/components/teacher/TeacherAttentionWorkspace";
import { getAccessibleCohorts, requireStaff } from "@/lib/cohorts/access";
import { createServerClient } from "@/lib/pocketbase-server";
import { loadTeacherAttentionData } from "@/lib/teacher/data";

export const dynamic = "force-dynamic";
export default async function StaffAttentionPage() { const user = await requireStaff(); const [pb, cohorts] = await Promise.all([createServerClient(), getAccessibleCohorts(user)]); const data = await loadTeacherAttentionData(pb, cohorts); return <TeacherAttentionWorkspace user={user} data={data} retryHref="/staff/attention" />; }

