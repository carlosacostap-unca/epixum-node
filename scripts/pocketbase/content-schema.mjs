import { ADMIN_ONLY, STAFF_ONLY, materializeField, mergeIndexes } from "./cohort-schema.mjs";

const STAFF = `(${STAFF_ONLY})`;
const SERVER_ONLY = { listRule: null, viewRule: null, createRule: null, updateRule: null, deleteRule: null };
const STAFF_MANAGED = { listRule: STAFF, viewRule: STAFF, createRule: STAFF, updateRule: STAFF, deleteRule: STAFF };
const BASE_READABLE = { listRule: STAFF, viewRule: STAFF, createRule: ADMIN_ONLY, updateRule: ADMIN_ONLY, deleteRule: ADMIN_ONLY };

export const CONTENT_COLLECTION_DEFINITIONS = {
  content_sections: {
    type: "base",
    fields: [
      relation("cohort", "cohorts", true),
      relation("week", "weeks", true),
      { name: "position", type: "number", required: true, onlyInt: true, min: 1 },
      { name: "title", type: "text", required: true, max: 500 },
      { name: "summary", type: "editor", required: false, maxSize: 20_000 },
      { name: "status", type: "select", required: true, maxSelect: 1, values: ["draft", "scheduled", "published", "hidden"] },
      { name: "scheduledAt", type: "date", required: false },
      { name: "publishedAt", type: "date", required: false },
      relation("currentRevision", "content_section_revisions", false, true),
      relation("sourceBaseVersion", "content_base_versions", false, true),
      { name: "sourceKey", type: "text", required: false, max: 160, pattern: "^[a-z0-9][a-z0-9_-]{2,159}$" },
    ],
    indexes: [
      "CREATE UNIQUE INDEX idx_content_section_week_position ON content_sections (week, position)",
      "CREATE UNIQUE INDEX idx_content_section_week_source ON content_sections (week, sourceKey) WHERE sourceKey != ''",
      "CREATE INDEX idx_content_section_availability ON content_sections (cohort, week, status, scheduledAt, position)",
    ],
    rules: STAFF_MANAGED,
  },
  content_section_revisions: {
    type: "base",
    fields: [
      relation("section", "content_sections", true),
      { name: "revisionNumber", type: "number", required: true, onlyInt: true, min: 1 },
      { name: "blocks", type: "json", required: true, maxSize: 1_500_000 },
      { name: "activityManifest", type: "json", required: false, maxSize: 300_000 },
      { name: "requirementsRevision", type: "text", required: true, max: 80, pattern: "^r[a-z0-9]{7,79}$" },
      { name: "note", type: "text", required: false, max: 1_000 },
      relation("author", "users", true),
    ],
    indexes: [
      "CREATE UNIQUE INDEX idx_content_revision_number ON content_section_revisions (section, revisionNumber)",
      "CREATE INDEX idx_content_revision_requirements ON content_section_revisions (section, requirementsRevision)",
    ],
    rules: SERVER_ONLY,
  },
  content_activity_attempts: {
    type: "base",
    fields: [
      relation("cohort", "cohorts", true),
      relation("week", "weeks", true),
      relation("section", "content_sections", true),
      relation("sectionRevision", "content_section_revisions", true),
      relation("student", "users", true),
      { name: "activityKey", type: "text", required: true, max: 80, pattern: "^[a-z0-9][a-z0-9_-]{2,79}$" },
      { name: "activityRevision", type: "text", required: true, max: 80, pattern: "^r[a-z0-9]{7,79}$" },
      { name: "activityKind", type: "select", required: true, maxSelect: 1, values: ["question", "checklist", "validator"] },
      { name: "response", type: "json", required: true, maxSize: 50_000 },
      { name: "outcome", type: "select", required: true, maxSelect: 1, values: ["correct", "incorrect", "satisfied", "pending"] },
      { name: "attemptKey", type: "text", required: true, max: 100, pattern: "^[a-zA-Z0-9_-]{16,100}$" },
      { name: "attemptedAt", type: "date", required: true },
    ],
    indexes: [
      "CREATE UNIQUE INDEX idx_content_attempt_idempotency ON content_activity_attempts (student, section, attemptKey)",
      "CREATE INDEX idx_content_attempt_student_activity ON content_activity_attempts (student, section, activityKey, activityRevision, attemptedAt)",
      "CREATE INDEX idx_content_attempt_analytics ON content_activity_attempts (cohort, week, section, activityKey, outcome)",
    ],
    rules: SERVER_ONLY,
  },
  content_section_progress: {
    type: "base",
    fields: [
      relation("cohort", "cohorts", true),
      relation("week", "weeks", true),
      relation("section", "content_sections", true),
      relation("student", "users", true),
      relation("lastRevision", "content_section_revisions", false),
      { name: "firstViewedAt", type: "date", required: true },
      { name: "lastViewedAt", type: "date", required: true },
      { name: "viewCount", type: "number", required: true, onlyInt: true, min: 1 },
      { name: "lastViewKey", type: "text", required: false, max: 100, pattern: "^[a-zA-Z0-9_-]{16,100}$" },
      { name: "lastBlockKey", type: "text", required: false, max: 80, pattern: "^[a-z0-9][a-z0-9_-]{2,79}$" },
      { name: "lastBlockIndex", type: "number", required: false, onlyInt: true, min: 0 },
      { name: "lastProgressKey", type: "text", required: false, max: 100, pattern: "^[a-zA-Z0-9_-]{16,100}$" },
      { name: "masteredActivities", type: "json", required: false, maxSize: 200_000 },
      { name: "requirementsRevision", type: "text", required: true, max: 80, pattern: "^r[a-z0-9]{7,79}$" },
      { name: "completedAt", type: "date", required: false },
    ],
    indexes: [
      "CREATE UNIQUE INDEX idx_content_progress_student_section ON content_section_progress (student, section)",
      "CREATE INDEX idx_content_progress_analytics ON content_section_progress (cohort, week, section, completedAt)",
    ],
    rules: SERVER_ONLY,
  },
  content_assets: {
    type: "base",
    fields: [
      { name: "kind", type: "select", required: true, maxSelect: 1, values: ["image", "video"] },
      { name: "file", type: "file", required: false, maxSelect: 1, maxSize: 104_857_600, mimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif", "video/mp4", "video/webm"], thumbs: ["0x400", "0x800"], protected: true },
      { name: "externalUrl", type: "url", required: false, exceptDomains: [], onlyDomains: [] },
      { name: "alt", type: "text", required: false, max: 500 },
      { name: "title", type: "text", required: false, max: 500 },
      { name: "importKey", type: "text", required: false, max: 200, pattern: "^[a-z0-9][a-z0-9_./-]{2,199}$" },
      relation("sourceBaseVersion", "content_base_versions", false, true),
      relation("author", "users", true),
    ],
    indexes: ["CREATE UNIQUE INDEX idx_content_asset_import_key ON content_assets (importKey) WHERE importKey != ''"],
    rules: { listRule: STAFF, viewRule: STAFF, createRule: STAFF, updateRule: null, deleteRule: STAFF },
  },
  content_bases: {
    type: "base",
    fields: [
      { name: "name", type: "text", required: true, max: 500 },
      { name: "kind", type: "select", required: true, maxSelect: 1, values: ["course", "week", "section"] },
      { name: "description", type: "editor", required: false, maxSize: 20_000 },
      { name: "active", type: "bool", required: true },
      relation("currentVersion", "content_base_versions", false, true),
      relation("createdBy", "users", true),
    ],
    indexes: ["CREATE INDEX idx_content_base_kind_active ON content_bases (kind, active, name)"],
    rules: BASE_READABLE,
  },
  content_base_versions: {
    type: "base",
    fields: [
      relation("base", "content_bases", true),
      { name: "versionNumber", type: "number", required: true, onlyInt: true, min: 1 },
      { name: "snapshot", type: "json", required: true, maxSize: 2_000_000 },
      { name: "sourceKind", type: "select", required: true, maxSelect: 1, values: ["copy", "promotion", "restore", "import"] },
      { name: "sourceReference", type: "text", required: false, max: 500 },
      { name: "note", type: "text", required: false, max: 1_000 },
      relation("createdBy", "users", true),
    ],
    indexes: ["CREATE UNIQUE INDEX idx_content_base_version_number ON content_base_versions (base, versionNumber)"],
    rules: { listRule: STAFF, viewRule: STAFF, createRule: ADMIN_ONLY, updateRule: null, deleteRule: null },
  },
};

export function materializeContentField(field, collectionsByName, allowPlanned = false) {
  const definition = { ...field };
  delete definition.deferred;
  return materializeField(definition, collectionsByName, allowPlanned);
}

export function planContentSchema(collections) {
  const byName = new Map(collections.map((collection) => [collection.name, collection]));
  const operations = [];
  for (const [name, definition] of Object.entries(CONTENT_COLLECTION_DEFINITIONS)) {
    const existing = byName.get(name);
    if (!existing) {
      operations.push({ action: "create_collection", collection: name });
      continue;
    }
    const missingFields = definition.fields.filter((field) => !(existing.fields || []).some((current) => current.name === field.name));
    for (const field of missingFields) operations.push({ action: "add_field", collection: name, field: field.name });
    const changedFields = definition.fields.filter((field) => {
      const current = (existing.fields || []).find((candidate) => candidate.name === field.name);
      return current && current.required !== field.required;
    });
    for (const field of changedFields) operations.push({ action: "update_field", collection: name, field: field.name, changes: ["required"] });
    const indexes = mergeIndexes(existing.indexes, definition.indexes);
    if (JSON.stringify(indexes) !== JSON.stringify(existing.indexes || [])) operations.push({ action: "merge_indexes", collection: name });
    const changedRules = Object.entries(definition.rules).filter(([key, value]) => existing[key] !== value).map(([key]) => key);
    if (changedRules.length) operations.push({ action: "set_rules", collection: name, rules: changedRules });
  }
  return operations;
}

export function assertContentDefinitions() {
  const knownTargets = new Set(["users", "cohorts", "weeks", ...Object.keys(CONTENT_COLLECTION_DEFINITIONS)]);
  for (const [name, definition] of Object.entries(CONTENT_COLLECTION_DEFINITIONS)) {
    for (const field of definition.fields.filter((item) => item.type === "relation")) {
      if (!knownTargets.has(field.target)) throw new Error(`${name}.${field.name} referencia una colección desconocida.`);
    }
  }
  return true;
}

function relation(name, target, required, deferred = false) {
  return { name, type: "relation", required, target, maxSelect: 1, cascadeDelete: false, ...(deferred ? { deferred: true } : {}) };
}
