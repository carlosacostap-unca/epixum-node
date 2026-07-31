"use server";

import { createServerClient } from "@/lib/pocketbase-server";
import { revalidatePath } from "next/cache";
import type { Sprint } from "@/types";
import { requireCohortAccess } from "@/lib/cohorts/access";

export async function submitStudentSurvey(formData: FormData) {
  const pb = await createServerClient();
  const user = pb.authStore.model;

  if (!user || user.role !== "estudiante") return { success: false, error: "No tenés permisos para enviar esta encuesta." };

  const sprint = formData.get("sprint") as string;
  const status = formData.get("status") as string;
  
  if (!sprint || !["completed", "incomplete_deliveries"].includes(status)) return { success: false, error: "La encuesta no es válida." };

  const data: any = {
      sprint,
      student: user.id,
      status,
  };

  if (status === 'completed') {
      data.feelings = formData.get("feelings");
      data.feedback = formData.get("feedback");
      data.suggestions = formData.get("suggestions");
  } else if (status === 'incomplete_deliveries') {
      data.futurePlan = formData.get("futurePlan");
      data.delayFactors = formData.get("delayFactors");
      data.attitudeReflection = formData.get("attitudeReflection");
      data.learningExperience = formData.get("learningExperience");
      data.futureStrategies = formData.get("futureStrategies");
      data.actionPlan = formData.get("actionPlan");
      data.personalCommitment = formData.get("personalCommitment");
      data.additionalComments = formData.get("additionalComments");
  }

  const required = status === "completed" ? ["feelings", "feedback"] : ["futurePlan", "delayFactors", "attitudeReflection", "learningExperience", "futureStrategies", "actionPlan", "personalCommitment"];
  if (required.some((field) => !String(data[field] || "").trim())) return { success: false, error: "Revisá los campos obligatorios antes de enviar." };

  try {
      const sprintRecord = await pb.collection("sprints").getOne<Sprint>(sprint, { fields: "id,cohort" });
      if (!sprintRecord.cohort) return { success: false, error: "El sprint no pertenece a una cohorte válida." };
      await requireCohortAccess(sprintRecord.cohort, { capability: "surveys", activeEnrollment: true });
      // Check if a survey already exists for this student and sprint
      const existingSurvey = await pb.collection('student_surveys').getFirstListItem(
          `sprint="${sprint}" && student="${user.id}"`
      ).catch(() => null);

      if (existingSurvey) {
          return { success: false, error: "Ya has enviado una respuesta para este sprint." };
      }

      await pb.collection('student_surveys').create(data);
      revalidatePath("/student-form");
      revalidatePath(`/cohorts/${sprintRecord.cohort}/survey`);
      return { success: true };
  } catch (error: any) {
      console.error("Error submitting survey:", error);
      return { success: false, error: error.message };
  }
}
