import StudentContentReader from "@/components/content/StudentContentReader";
import { getStudentContentReader } from "@/lib/content/student";

export default async function ContentSectionPage({ params }: { params: Promise<{ cohortId: string; weekId: string; sectionId: string }> }) {
  const { cohortId, weekId, sectionId } = await params;
  const data = await getStudentContentReader(cohortId, weekId, sectionId);
  return <StudentContentReader cohortId={cohortId} weekId={weekId} {...data} />;
}
