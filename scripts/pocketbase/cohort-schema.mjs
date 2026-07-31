export const TRANSITION_AUTHENTICATED = '@request.auth.id != ""';
export const STAFF_ONLY = '@request.auth.role = "docente" || @request.auth.role = "admin"';
export const ADMIN_ONLY = '@request.auth.role = "admin"';

export const COLLECTION_DEFINITIONS = {
  cohorts: {
    type: "base",
    fields: [
      { name: "name", type: "text", required: true, max: 160 },
      { name: "slug", type: "text", required: true, max: 100, pattern: "^[a-z0-9]+(?:-[a-z0-9]+)*$" },
      { name: "mode", type: "select", required: true, maxSelect: 1, values: ["sprints_and_teams", "weekly"] },
      { name: "status", type: "select", required: true, maxSelect: 1, values: ["active", "archived"] },
      { name: "startDate", type: "date", required: false },
      { name: "endDate", type: "date", required: false },
    ],
    indexes: ["CREATE UNIQUE INDEX idx_cohorts_slug ON cohorts (slug)"],
    rules: { listRule: TRANSITION_AUTHENTICATED, viewRule: TRANSITION_AUTHENTICATED, createRule: ADMIN_ONLY, updateRule: ADMIN_ONLY, deleteRule: ADMIN_ONLY },
  },
  cohort_enrollments: {
    type: "base",
    fields: [
      { name: "user", type: "relation", required: true, target: "users", maxSelect: 1, cascadeDelete: false },
      { name: "cohort", type: "relation", required: true, target: "cohorts", maxSelect: 1, cascadeDelete: false },
      { name: "status", type: "select", required: true, maxSelect: 1, values: ["active", "completed"] },
      { name: "entryType", type: "select", required: true, maxSelect: 1, values: ["new", "repeater"] },
      { name: "enrolledAt", type: "date", required: true },
      { name: "completedAt", type: "date", required: false },
    ],
    indexes: ["CREATE UNIQUE INDEX idx_enrollment_user_cohort ON cohort_enrollments (user, cohort)"],
    rules: {
      listRule: 'user = @request.auth.id || @request.auth.role = "docente" || @request.auth.role = "admin"',
      viewRule: 'user = @request.auth.id || @request.auth.role = "docente" || @request.auth.role = "admin"',
      createRule: ADMIN_ONLY,
      updateRule: ADMIN_ONLY,
      deleteRule: ADMIN_ONLY,
    },
  },
  student_admissions: {
    type: "base",
    fields: [
      { name: "normalizedEmail", type: "email", required: true },
      { name: "displayName", type: "text", required: true, max: 160 },
      { name: "dni", type: "text", required: false, max: 32 },
      { name: "birthDate", type: "date", required: false },
      { name: "phone", type: "text", required: false, max: 50 },
      { name: "cohort", type: "relation", required: true, target: "cohorts", maxSelect: 1, cascadeDelete: false },
      { name: "entryType", type: "select", required: true, maxSelect: 1, values: ["new", "repeater"] },
      { name: "status", type: "select", required: true, maxSelect: 1, values: ["pending", "claimed", "cancelled"] },
      { name: "claimedBy", type: "relation", required: false, target: "users", maxSelect: 1, cascadeDelete: false },
      { name: "claimedAt", type: "date", required: false },
    ],
    indexes: ["CREATE UNIQUE INDEX idx_admission_pending_email_cohort ON student_admissions (normalizedEmail, cohort) WHERE status = 'pending'"],
    rules: { listRule: ADMIN_ONLY, viewRule: ADMIN_ONLY, createRule: ADMIN_ONLY, updateRule: ADMIN_ONLY, deleteRule: ADMIN_ONLY },
  },
  weeks: {
    type: "base",
    fields: [
      { name: "cohort", type: "relation", required: true, target: "cohorts", maxSelect: 1, cascadeDelete: false },
      { name: "number", type: "number", required: true, onlyInt: true, min: 1 },
      { name: "title", type: "text", required: true, max: 180 },
      { name: "description", type: "editor", required: false },
      { name: "startDate", type: "date", required: false },
      { name: "endDate", type: "date", required: false },
      { name: "publicationStatus", type: "select", required: true, maxSelect: 1, values: ["draft", "published"] },
      { name: "publishedAt", type: "date", required: false },
    ],
    indexes: ["CREATE UNIQUE INDEX idx_week_cohort_number ON weeks (cohort, number)"],
    rules: { listRule: TRANSITION_AUTHENTICATED, viewRule: TRANSITION_AUTHENTICATED, createRule: STAFF_ONLY, updateRule: STAFF_ONLY, deleteRule: STAFF_ONLY },
  },
  javascript_assessment_results: {
    type: "base",
    fields: [
      { name: "cohort", type: "relation", required: true, target: "cohorts", maxSelect: 1, cascadeDelete: false },
      { name: "student", type: "relation", required: true, target: "users", maxSelect: 1, cascadeDelete: false },
      { name: "assessmentVersion", type: "text", required: true, max: 80 },
      { name: "attemptKind", type: "select", required: false, maxSelect: 1, values: ["initial", "practice"] },
      { name: "attemptKey", type: "text", required: false, max: 100, pattern: "^[a-zA-Z0-9_-]{16,100}$" },
      { name: "answers", type: "json", required: true, maxSize: 20000 },
      { name: "score", type: "number", required: true, onlyInt: true, min: 0, max: 100 },
      { name: "totalQuestions", type: "number", required: true, onlyInt: true, min: 1, max: 100 },
      { name: "completedAt", type: "date", required: true },
    ],
    indexes: [
      "CREATE INDEX idx_js_assessment_student_cohort_version ON javascript_assessment_results (student, cohort, assessmentVersion)",
      "CREATE UNIQUE INDEX idx_js_assessment_attempt_key ON javascript_assessment_results (student, cohort, assessmentVersion, attemptKey) WHERE attemptKey != ''",
      "CREATE UNIQUE INDEX idx_js_assessment_initial ON javascript_assessment_results (student, cohort, assessmentVersion) WHERE attemptKind = 'initial'",
    ],
    rules: { listRule: null, viewRule: null, createRule: null, updateRule: null, deleteRule: null },
  },
  enrollment_requests: {
    type: "base",
    fields: [
      { name: "firstName", type: "text", required: true, max: 80 },
      { name: "lastName", type: "text", required: true, max: 80 },
      { name: "dni", type: "text", required: true, max: 20 },
      { name: "birthDate", type: "date", required: true },
      { name: "normalizedEmail", type: "email", required: true },
      { name: "phone", type: "text", required: true, max: 50 },
      { name: "cohort", type: "relation", required: true, target: "cohorts", maxSelect: 1, cascadeDelete: false },
      { name: "status", type: "select", required: true, maxSelect: 1, values: ["pending", "approved", "rejected"] },
      { name: "reviewedBy", type: "relation", required: false, target: "users", maxSelect: 1, cascadeDelete: false },
      { name: "reviewedAt", type: "date", required: false },
      { name: "resolution", type: "text", required: false, max: 200 },
      { name: "linkedUser", type: "relation", required: false, target: "users", maxSelect: 1, cascadeDelete: false },
      { name: "admission", type: "relation", required: false, target: "student_admissions", maxSelect: 1, cascadeDelete: false },
      { name: "created", type: "autodate", onCreate: true, onUpdate: false },
      { name: "updated", type: "autodate", onCreate: true, onUpdate: true },
    ],
    indexes: [
      "CREATE UNIQUE INDEX idx_request_pending_email_cohort ON enrollment_requests (normalizedEmail, cohort) WHERE status = 'pending'",
      "CREATE UNIQUE INDEX idx_request_pending_dni_cohort ON enrollment_requests (dni, cohort) WHERE status = 'pending'",
    ],
    rules: { listRule: null, viewRule: null, createRule: null, updateRule: null, deleteRule: null },
  },
};

export const EXISTING_COLLECTION_ADDITIONS = {
  sprints: [{ name: "cohort", type: "relation", required: false, target: "cohorts", maxSelect: 1, cascadeDelete: false }],
  teams: [{ name: "cohort", type: "relation", required: false, target: "cohorts", maxSelect: 1, cascadeDelete: false }],
  inquiries: [
    { name: "cohort", type: "relation", required: false, target: "cohorts", maxSelect: 1, cascadeDelete: false },
    { name: "week", type: "relation", required: false, target: "weeks", maxSelect: 1, cascadeDelete: false },
  ],
  classes: [{ name: "week", type: "relation", required: false, target: "weeks", maxSelect: 1, cascadeDelete: false }],
  assignments: [{ name: "week", type: "relation", required: false, target: "weeks", maxSelect: 1, cascadeDelete: false }],
};

export function materializeField(field, collectionsByName, allowPlanned = false) {
  const { target, ...definition } = field;
  if (definition.type === "relation") {
    const targetCollection = collectionsByName.get(target);
    if (!targetCollection && !allowPlanned) throw new Error(`No existe la colección relacionada ${target}.`);
    definition.collectionId = targetCollection?.id || `[planned:${target}]`;
  }
  return definition;
}

export function mergeIndexes(existing = [], additions = []) {
  const byName = new Map();
  for (const statement of [...existing, ...additions]) {
    const name = statement.match(/INDEX\s+(?:IF NOT EXISTS\s+)?([^\s]+)\s+/i)?.[1] || statement;
    byName.set(name, statement);
  }
  return [...byName.values()];
}
