"use server";

import { createServerClient } from "@/lib/pocketbase-server";
import { revalidatePath } from "next/cache";

export async function submitStudentSurvey(formData: FormData) {
  const pb = await createServerClient();
  const user = pb.authStore.model;

  if (!user) {
    throw new Error("Unauthorized");
  }

  const sprint = formData.get("sprint") as string;
  const status = formData.get("status") as string;
  
  if (!sprint || !status) {
      throw new Error("Missing required fields");
  }

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

  try {
      // Check if a survey already exists for this student and sprint
      const existingSurvey = await pb.collection('student_surveys').getFirstListItem(
          `sprint="${sprint}" && student="${user.id}"`
      ).catch(() => null);

      if (existingSurvey) {
          return { success: false, error: "Ya has enviado una respuesta para este sprint." };
      }

      await pb.collection('student_surveys').create(data);
      revalidatePath("/student-form");
      return { success: true };
  } catch (error: any) {
      console.error("Error submitting survey:", error);
      return { success: false, error: error.message };
  }
}
