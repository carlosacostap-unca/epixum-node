import { createAdminClient, outputJson } from "./client.mjs";

const baseUrl = process.env.E2E_BASE_URL || "http://localhost:3000";
const pb = await createAdminClient();

const [admin, teacher, activeEnrollment, weeklyCohort, sprintCohort] = await Promise.all([
  pb.collection("users").getFirstListItem('role = "admin"'),
  pb.collection("users").getFirstListItem('role = "docente"'),
  pb.collection("cohort_enrollments").getFirstListItem("status = 'active' && cohort.status = 'active'", { expand: "user,cohort" }),
  pb.collection("cohorts").getFirstListItem('mode = "weekly"'),
  pb.collection("cohorts").getFirstListItem('mode = "sprints_and_teams"'),
]);

const student = activeEnrollment.expand?.user;
const studentCohort = activeEnrollment.expand?.cohort;
if (!student || student.role !== "estudiante") {
  throw new Error("No se encontró un estudiante con matrícula activa para la prueba de entrada.");
}
if (!studentCohort) throw new Error("La matrícula activa no tiene una cohorte expandible.");
const studentActiveEnrollments = await pb.collection("cohort_enrollments").getFullList({
  filter: pb.filter("user = {:user} && status = 'active'", { user: student.id }),
});
const [weekPage, sprintPage] = await Promise.all([
  pb.collection("weeks").getList(1, 1, { expand: "cohort" }),
  pb.collection("sprints").getList(1, 1, { filter: "cohort.mode = 'sprints_and_teams'", expand: "cohort" }),
]);
const week = weekPage.items[0] || null;
const sprint = sprintPage.items[0] || null;
const weekCohort = week?.expand?.cohort;
const detailSprintCohort = sprint?.expand?.cohort;
if ((week && !weekCohort) || (sprint && !detailSprintCohort)) throw new Error("No se pudieron expandir las cohortes de los contenidos de prueba.");
const classItem = (await pb.collection("classes").getList(1, 1, { filter: "sprint.cohort.mode = 'sprints_and_teams'" })).items[0] || null;
const classSprint = classItem ? await pb.collection("sprints").getOne(classItem.sprint, { expand: "cohort" }) : null;
const classCohort = classSprint?.expand?.cohort;
if (classItem && !classCohort) throw new Error("No se pudo resolver la cohorte de la clase de prueba.");
const assignmentItem = (await pb.collection("assignments").getList(1, 1, { filter: "sprint.cohort.mode = 'sprints_and_teams'" })).items[0] || null;

function cookieFor(session) {
  return session.authStore
    .exportToCookie({ secure: false, sameSite: "Lax", path: "/" })
    .split(";")[0];
}

async function inspect(path, cookie) {
  const response = await fetch(`${baseUrl}${path}`, {
    headers: cookie ? { cookie } : undefined,
    redirect: "manual",
  });
  return { status: response.status, location: response.headers.get("location"), html: await response.text() };
}
async function inspectSequentially(requests) {
  const results = [];
  for (const [path, cookie, enabled = true] of requests) results.push(enabled ? await inspect(path, cookie) : { status: 204, html: "", location: null });
  return results;
}

const [adminSession, teacherSession, studentSession] = await Promise.all([
  pb.collection("users").impersonate(admin.id, 300),
  pb.collection("users").impersonate(teacher.id, 300),
  pb.collection("users").impersonate(student.id, 300),
]);
const adminCookie = cookieFor(adminSession);
const teacherCookie = cookieFor(teacherSession);
const studentCookie = cookieFor(studentSession);

const [login, requestForm, anonymousHome, studentHome, teacherHome, adminHome, studentCohorts, teacherCohorts, adminCohorts, selectedCohort, weeklyCollection, sprintCollection, weekDetail, sprintDetail, classDetail, legacySprint, legacyClass, legacyAssignment, missingContent] = await inspectSequentially([
  ["/login"], ["/enrollment-request"], ["/"], ["/", studentCookie], ["/", teacherCookie], ["/", adminCookie],
  ["/cohorts", studentCookie], ["/cohorts", teacherCookie], ["/cohorts", adminCookie], [`/cohorts/${studentCohort.id}`, studentCookie],
  [`/cohorts/${weeklyCohort.id}/weeks`, adminCookie], [`/cohorts/${sprintCohort.id}/sprints`, adminCookie],
  [`/cohorts/${weekCohort?.id}/weeks/${week?.id}?section=classes`, adminCookie, Boolean(week)],
  [`/cohorts/${detailSprintCohort?.id}/sprints/${sprint?.id}?section=assignments`, adminCookie, Boolean(sprint)],
  [`/cohorts/${classCohort?.id}/classes/${classItem?.id}`, adminCookie, Boolean(classItem)],
  [`/sprints/${sprint?.id}`, adminCookie, Boolean(sprint)],
  [`/classes/${classItem?.id}`, adminCookie, Boolean(classItem)],
  [`/assignments/${assignmentItem?.id}`, adminCookie, Boolean(assignmentItem)],
  [`/cohorts/${sprintCohort.id}/sprints/missing-academic-content`, adminCookie],
]);

const requiredFields = ["firstName", "lastName", "dni", "birthDate", "email", "phone", "cohortId"];
const checks = {
  publicLogin: login.status === 200 && login.html.includes("Ingresá a Back End con Node.js") && !login.html.includes("Solicitar matriculación"),
  publicRequest: requestForm.status === 200 && requestForm.html.includes("Solicitar matriculación") && requiredFields.every((name) => requestForm.html.includes(`name="${name}"`)),
  protectedHome: [301, 302, 307, 308].includes(anonymousHome.status) && anonymousHome.location?.includes("/login"),
  studentHome: studentHome.status === 200 && (studentHome.html.includes("Próximo paso") || studentHome.html.includes("Todavía no tenés una cohorte asignada")),
  teacherHome: teacherHome.status === 200 && teacherHome.html.includes("Panel docente") && teacherHome.html.includes("Consultas pendientes"),
  adminHome: adminHome.status === 200 && adminHome.html.includes("Estado general de la plataforma") && adminHome.html.includes("Gestionar usuarios"),
  studentCohortSelection: studentActiveEnrollments.length === 1
    ? redirectsToHome(studentCohorts)
    : studentCohorts.status === 200 && studentCohorts.html.includes("Mis cohortes") && studentCohorts.html.includes(studentCohort.name),
  singleStudentCohortContext: studentActiveEnrollments.length !== 1
    || (studentHome.status === 200 && !studentHome.html.includes("Cohorte activa") && !studentHome.html.includes('href="/cohorts"')),
  teacherCohortSelection: teacherCohorts.status === 200 && teacherCohorts.html.includes("Seleccioná una cohorte") && teacherCohorts.html.includes("Alumnos activos"),
  adminCohortSelection: adminCohorts.status === 200 && adminCohorts.html.includes("Seleccioná una cohorte") && adminCohorts.html.includes("Solicitudes"),
  selectedCohort: selectedCohort.status === 200 && selectedCohort.html.includes(studentCohort.name),
  weeklyCollection: weeklyCollection.status === 200 && weeklyCollection.html.includes("Semanas") && weeklyCollection.html.includes("Crear semana"),
  sprintCollection: sprintCollection.status === 200 && sprintCollection.html.includes("Sprints") && sprintCollection.html.includes("Crear sprint"),
  weekDetail: !week || (weekDetail.status === 200 && weekDetail.html.includes("Resumen") && weekDetail.html.includes("Clases (") && weekDetail.html.includes("Administrar esta semana")),
  sprintDetail: !sprint || (sprintDetail.status === 200 && sprintDetail.html.includes("Resumen") && sprintDetail.html.includes("Trabajos (") && sprintDetail.html.includes("Administrar contenido")),
  classDetail: !classItem || (classDetail.status === 200 && classDetail.html.includes(classItem.title) && classDetail.html.includes("Recursos de la clase") && classDetail.html.includes("Consultas sobre esta clase")),
  legacySprintRedirect: !sprint || compatibilityRedirectsTo(legacySprint, `/cohorts/${detailSprintCohort.id}/sprints/${sprint.id}`),
  legacyClassRedirect: !classItem || compatibilityRedirectsTo(legacyClass, `/cohorts/${classCohort.id}/classes/${classItem.id}`),
  legacyAssignmentRedirect: !assignmentItem || compatibilityRedirectsTo(legacyAssignment, "/cohorts/", `/assignments/${assignmentItem.id}`),
  // Next.js puede conservar 200 cuando notFound() se resuelve dentro de una
  // respuesta transmitida; el marcador y el fallback renderizado son la
  // garantía observable para la persona usuaria en ese caso.
  missingContentNotFound: [200, 404].includes(missingContent.status)
    && (missingContent.html.includes("This page could not be found")
      || missingContent.html.includes("NEXT_HTTP_ERROR_FALLBACK;404")),
};

function compatibilityRedirectsTo(result, ...fragments) {
  if ([301, 302, 307, 308].includes(result.status)) return fragments.every((fragment) => result.location?.includes(fragment));
  return result.status === 200 && result.html.includes("NEXT_REDIRECT") && fragments.every((fragment) => result.html.includes(fragment));
}

function redirectsToHome(result) {
  if ([301, 302, 307, 308].includes(result.status)) return new URL(result.location, baseUrl).pathname === "/";
  return result.status === 200 && result.html.includes("NEXT_REDIRECT") && result.html.includes("replace;/;");
}

if (Object.values(checks).some((check) => !check)) {
  throw new Error(`Falló la verificación de entrada por rol: ${JSON.stringify({ checks, statuses: {
    login: login.status,
    requestForm: requestForm.status,
    anonymousHome: anonymousHome.status,
    studentHome: studentHome.status,
    teacherHome: teacherHome.status,
    adminHome: adminHome.status,
    studentCohorts: studentCohorts.status,
    teacherCohorts: teacherCohorts.status,
    adminCohorts: adminCohorts.status,
    selectedCohort: selectedCohort.status,
    weeklyCollection: weeklyCollection.status,
    sprintCollection: sprintCollection.status,
    weekDetail: weekDetail.status,
    sprintDetail: sprintDetail.status,
    classDetail: classDetail.status,
    legacySprint: legacySprint.status,
    legacyClass: legacyClass.status,
    legacyAssignment: legacyAssignment.status,
    missingContent: missingContent.status,
  } })}`);
}

outputJson({ baseUrl, cohort: { id: studentCohort.id, name: studentCohort.name }, checks });
