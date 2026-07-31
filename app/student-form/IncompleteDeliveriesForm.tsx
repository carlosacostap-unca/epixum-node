import SurveyWizard from "./SurveyWizard";
export default function IncompleteDeliveriesForm({ sprintId }: { userId: string; sprintId: string }) { return <SurveyWizard sprintId={sprintId} branch="incomplete_deliveries" />; }
