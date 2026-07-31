export const STAFF = '(@request.auth.role = "docente" || @request.auth.role = "admin")';
const relationPath = (path, relation) => path ? `${path}.${relation}` : relation;
const enrolled = (path) => `(${relationPath(path, "cohort_enrollments_via_cohort.user")} ?= @request.auth.id)`;
const active = (path) => `(${relationPath(path, "cohort_enrollments_via_cohort.user")} ?= @request.auth.id && ${relationPath(path, "cohort_enrollments_via_cohort.status")} ?= "active")`;
const publishedWeek = (path) => `(${path}.publicationStatus = "published" && ${enrolled(`${path}.cohort`)})`;
const visibleClass = `(${enrolled("sprint.cohort")} || ${publishedWeek("week")})`;
const visibleAssignment = `(${enrolled("sprint.cohort")} || ${publishedWeek("week")})`;

export const HARDENED_RULES = {
  users: {
    listRule: `(id = @request.auth.id || ${STAFF})`, viewRule: `(id = @request.auth.id || ${STAFF})`,
  },
  cohorts: {
    listRule: `${STAFF} || ${enrolled("")}`, viewRule: `${STAFF} || ${enrolled("")}`,
    createRule: '@request.auth.role = "admin"', updateRule: '@request.auth.role = "admin"', deleteRule: '@request.auth.role = "admin"',
  },
  cohort_enrollments: {
    listRule: `user = @request.auth.id || ${STAFF}`, viewRule: `user = @request.auth.id || ${STAFF}`,
    createRule: '@request.auth.role = "admin"', updateRule: '@request.auth.role = "admin"', deleteRule: '@request.auth.role = "admin"',
  },
  student_admissions: {
    listRule: '@request.auth.role = "admin"', viewRule: '@request.auth.role = "admin"', createRule: '@request.auth.role = "admin"', updateRule: '@request.auth.role = "admin"', deleteRule: '@request.auth.role = "admin"',
  },
  weeks: {
    listRule: `${STAFF} || (publicationStatus = "published" && ${enrolled("cohort")})`,
    viewRule: `${STAFF} || (publicationStatus = "published" && ${enrolled("cohort")})`, createRule: STAFF, updateRule: STAFF, deleteRule: STAFF,
  },
  sprints: {
    listRule: `${STAFF} || ${enrolled("cohort")}`, viewRule: `${STAFF} || ${enrolled("cohort")}`, createRule: STAFF, updateRule: STAFF, deleteRule: STAFF,
  },
  teams: {
    listRule: `${STAFF} || (${enrolled("cohort")} && members ?= @request.auth.id)`, viewRule: `${STAFF} || (${enrolled("cohort")} && members ?= @request.auth.id)`, createRule: STAFF, updateRule: STAFF, deleteRule: STAFF,
  },
  messages: {
    listRule: `${STAFF} || (${enrolled("team.cohort")} && team.members ?= @request.auth.id)`, viewRule: `${STAFF} || (${enrolled("team.cohort")} && team.members ?= @request.auth.id)`,
    createRule: `sender = @request.auth.id && ${active("team.cohort")} && team.members ?= @request.auth.id`, updateRule: `sender = @request.auth.id || ${STAFF}`, deleteRule: `sender = @request.auth.id || ${STAFF}`,
  },
  classes: { listRule: `${STAFF} || ${visibleClass}`, viewRule: `${STAFF} || ${visibleClass}`, createRule: STAFF, updateRule: STAFF, deleteRule: STAFF },
  assignments: { listRule: `${STAFF} || ${visibleAssignment}`, viewRule: `${STAFF} || ${visibleAssignment}`, createRule: STAFF, updateRule: STAFF, deleteRule: STAFF },
  links: {
    listRule: `${STAFF} || (${visibleClass.replaceAll("sprint.", "class.sprint.").replaceAll("week.", "class.week.")} || ${visibleAssignment.replaceAll("sprint.", "assignment.sprint.").replaceAll("week.", "assignment.week.")})`,
    viewRule: `${STAFF} || (${visibleClass.replaceAll("sprint.", "class.sprint.").replaceAll("week.", "class.week.")} || ${visibleAssignment.replaceAll("sprint.", "assignment.sprint.").replaceAll("week.", "assignment.week.")})`, createRule: STAFF, updateRule: STAFF, deleteRule: STAFF,
  },
  deliveries: {
    listRule: `${STAFF} || (student = @request.auth.id && ${visibleAssignment.replaceAll("sprint.", "assignment.sprint.").replaceAll("week.", "assignment.week.")})`,
    viewRule: `${STAFF} || (student = @request.auth.id && ${visibleAssignment.replaceAll("sprint.", "assignment.sprint.").replaceAll("week.", "assignment.week.")})`,
    createRule: `student = @request.auth.id && (${active("assignment.sprint.cohort")} || (assignment.week.publicationStatus = "published" && ${active("assignment.week.cohort")}))`,
    updateRule: `student = @request.auth.id && (${active("assignment.sprint.cohort")} || (assignment.week.publicationStatus = "published" && ${active("assignment.week.cohort")}))`, deleteRule: `student = @request.auth.id || ${STAFF}`,
  },
  inquiries: {
    listRule: `${STAFF} || ${enrolled("cohort")}`, viewRule: `${STAFF} || ${enrolled("cohort")}`,
    createRule: `author = @request.auth.id && ${active("cohort")}`, updateRule: `(${STAFF} || author = @request.auth.id) && ${active("cohort")}`, deleteRule: `${STAFF} || (author = @request.auth.id && ${active("cohort")})`,
  },
  inquiry_responses: {
    listRule: `${STAFF} || ${enrolled("inquiry.cohort")}`, viewRule: `${STAFF} || ${enrolled("inquiry.cohort")}`,
    createRule: `author = @request.auth.id && ${active("inquiry.cohort")}`, updateRule: `${STAFF} || (author = @request.auth.id && ${active("inquiry.cohort")})`, deleteRule: `${STAFF} || (author = @request.auth.id && ${active("inquiry.cohort")})`,
  },
  reviews: { listRule: `${STAFF} || (student = @request.auth.id && ${enrolled("sprint.cohort")})`, viewRule: `${STAFF} || (student = @request.auth.id && ${enrolled("sprint.cohort")})`, createRule: STAFF, updateRule: STAFF, deleteRule: STAFF },
  student_surveys: { listRule: `${STAFF} || (student = @request.auth.id && ${enrolled("sprint.cohort")})`, viewRule: `${STAFF} || (student = @request.auth.id && ${enrolled("sprint.cohort")})`, createRule: `${STAFF} || (student = @request.auth.id && ${active("sprint.cohort")})`, updateRule: `${STAFF} || (student = @request.auth.id && ${active("sprint.cohort")})`, deleteRule: STAFF },
};

export function ruleChanges(collections) {
  const byName = new Map(collections.map(item => [item.name, item]));
  return Object.entries(HARDENED_RULES).flatMap(([name, rules]) => {
    const collection = byName.get(name);
    if (!collection) return [{ collection: name, action: "missing_collection" }];
    const changedRules = Object.entries(rules).filter(([key, value]) => collection[key] !== value).map(([key]) => key);
    const requiredFields = ["sprints", "teams", "inquiries"].includes(name) && collection.fields?.some(field => field.name === "cohort" && !field.required) ? ["cohort"] : [];
    return changedRules.length || requiredFields.length ? [{ collection: name, action: "harden", rules: changedRules, requiredFields }] : [];
  });
}
