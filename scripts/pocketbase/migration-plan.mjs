export function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

export function duplicateEmails(users) {
  const grouped = new Map();
  for (const user of users) {
    const email = normalizeEmail(user.email);
    if (!email) continue;
    grouped.set(email, [...(grouped.get(email) || []), user.id]);
  }
  return [...grouped.entries()]
    .filter(([, ids]) => ids.length > 1)
    .map(([email, userIds]) => ({ email, userIds }));
}

function missingReference(records, field, validIds) {
  return records
    .filter((record) => record[field] && !validIds.has(record[field]))
    .map((record) => ({ id: record.id, field, value: record[field] }));
}

export function analyzeSnapshot(snapshot) {
  const users = snapshot.users || [];
  const sprints = snapshot.sprints || [];
  const teams = snapshot.teams || [];
  const classes = snapshot.classes || [];
  const assignments = snapshot.assignments || [];
  const deliveries = snapshot.deliveries || [];
  const inquiries = snapshot.inquiries || [];
  const messages = snapshot.messages || [];
  const reviews = snapshot.reviews || [];
  const surveys = snapshot.student_surveys || [];
  const ids = {
    users: new Set(users.map((record) => record.id)),
    sprints: new Set(sprints.map((record) => record.id)),
    teams: new Set(teams.map((record) => record.id)),
    classes: new Set(classes.map((record) => record.id)),
    assignments: new Set(assignments.map((record) => record.id)),
  };
  const invalidParents = [
    ...classes.filter((record) => Boolean(record.sprint) === Boolean(record.week)).map((record) => ({ collection: "classes", id: record.id })),
    ...assignments.filter((record) => Boolean(record.sprint) === Boolean(record.week)).map((record) => ({ collection: "assignments", id: record.id })),
  ];
  const orphaned = [
    ...missingReference(classes, "sprint", ids.sprints).map((item) => ({ collection: "classes", ...item })),
    ...missingReference(assignments, "sprint", ids.sprints).map((item) => ({ collection: "assignments", ...item })),
    ...missingReference(deliveries, "assignment", ids.assignments).map((item) => ({ collection: "deliveries", ...item })),
    ...missingReference(deliveries, "student", ids.users).map((item) => ({ collection: "deliveries", ...item })),
    ...missingReference(inquiries, "class", ids.classes).map((item) => ({ collection: "inquiries", ...item })),
    ...missingReference(inquiries, "assignment", ids.assignments).map((item) => ({ collection: "inquiries", ...item })),
    ...missingReference(messages, "team", ids.teams).map((item) => ({ collection: "messages", ...item })),
    ...missingReference(messages, "sender", ids.users).map((item) => ({ collection: "messages", ...item })),
    ...missingReference(reviews, "sprint", ids.sprints).map((item) => ({ collection: "reviews", ...item })),
    ...missingReference(surveys, "sprint", ids.sprints).map((item) => ({ collection: "student_surveys", ...item })),
  ];
  return {
    counts: Object.fromEntries(Object.entries(snapshot).map(([name, records]) => [name, records.length])),
    duplicateEmails: duplicateEmails(users),
    orphaned,
    invalidParents,
    missingCohort: {
      sprints: sprints.filter((record) => !record.cohort).map((record) => record.id),
      teams: teams.filter((record) => !record.cohort).map((record) => record.id),
      inquiries: inquiries.filter((record) => !record.cohort).map((record) => record.id),
    },
    studentsWithoutEnrollment: users.filter((user) => user.role === "estudiante").map((user) => user.id),
  };
}
