export type AnalyticsProgress = "all" | "complete" | "pending" | "empty";
export type AnalyticsStatus = "all" | "pending" | "resolved" | "active" | "completed";

export interface AnalyticsFilters { period: string; progress: AnalyticsProgress; status: AnalyticsStatus; search: string; detail: string }

export function normalizeAnalyticsFilters(input: Record<string, string | string[] | undefined>): AnalyticsFilters {
  const value = (key: string) => typeof input[key] === "string" ? input[key] as string : "";
  const progress = value("progress"); const status = value("status");
  return {
    period: value("period") || "all",
    progress: (["complete", "pending", "empty"].includes(progress) ? progress : "all") as AnalyticsProgress,
    status: (["pending", "resolved", "active", "completed"].includes(status) ? status : "all") as AnalyticsStatus,
    search: value("search").trim(), detail: value("detail"),
  };
}

export function percentage(part: number, total: number) { return total <= 0 ? 0 : Math.round((part / total) * 100); }

export function matchesSearch(values: Array<string | undefined>, search: string) {
  if (!search) return true; const query = search.toLocaleLowerCase("es"); return values.some((value) => value?.toLocaleLowerCase("es").includes(query));
}

export function assessmentQuestionInsights<T extends { answers?: Record<string, string> }>(results: T[], questions: Array<{ id: string; correctOptionId: string }>) {
  return questions.map((question) => { const answered = results.filter((result) => Boolean(result.answers?.[question.id])).length; const correct = results.filter((result) => result.answers?.[question.id] === question.correctOptionId).length; return { questionId: question.id, answered, correct, incorrect: answered - correct, accuracy: percentage(correct, answered) }; });
}

export function assessmentCategoryInsights<T extends { answers?: Record<string, string> }>(
  results: T[],
  questions: Array<{ id: string; categoryId: string; correctOptionId: string }>,
  categories: Array<{ id: string; label: string }>,
) {
  return categories.map((category) => {
    const categoryQuestions = questions.filter((question) => question.categoryId === category.id);
    const answered = results.reduce((total, result) => total + categoryQuestions.filter((question) => Boolean(result.answers?.[question.id])).length, 0);
    const correct = results.reduce((total, result) => total + categoryQuestions.filter((question) => result.answers?.[question.id] === question.correctOptionId).length, 0);
    return { id: category.id, label: category.label, answered, correct, incorrect: answered - correct, accuracy: percentage(correct, answered) };
  });
}
