import SurveyWizard from "./SurveyWizard";
export default function CompleteDeliveriesForm({ sprintId }: { userId: string; sprintId: string }) { return <SurveyWizard sprintId={sprintId} branch="completed" />; }
