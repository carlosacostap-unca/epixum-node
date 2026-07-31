import { createAdminClient, outputJson } from "./client.mjs";

const baseUrl = process.env.E2E_BASE_URL || "http://localhost:3000";
const pb = await createAdminClient();
const admin = await pb.collection("users").getFirstListItem('role = "admin"');
const enrollment = await pb.collection("cohort_enrollments").getFirstListItem("status = 'active'", { expand: "user" });
const student = enrollment.expand?.user;
if (!student || student.role !== "estudiante") throw new Error("No se encontró un estudiante activo para verificar permisos.");

function cookieFor(session) { return session.authStore.exportToCookie({ secure: false, sameSite: "Lax", path: "/" }).split(";")[0]; }
async function request(path, options = {}) { const response = await fetch(`${baseUrl}${path}`, options); return { response, html: await response.text() }; }

const adminSession = await pb.collection("users").impersonate(admin.id, 300);
const studentSession = await pb.collection("users").impersonate(student.id, 300);
const [publicForm, anonymousStaff, adminStaff, studentStaff, login] = await Promise.all([
  request("/enrollment-request"),
  request("/staff/enrollment-requests", { redirect: "manual" }),
  request("/staff/enrollment-requests", { headers: { cookie: cookieFor(adminSession) } }),
  request("/staff/enrollment-requests", { headers: { cookie: cookieFor(studentSession) } }),
  request("/login"),
]);
const requiredNames = ["firstName", "lastName", "dni", "birthDate", "email", "phone", "cohortId"];
const checks = {
  publicFormVisible: publicForm.response.ok && publicForm.html.includes("Solicitar matriculación") && requiredNames.every((name) => publicForm.html.includes(`name=\"${name}\"`)),
  anonymousStaffRedirected: [301, 302, 307, 308].includes(anonymousStaff.response.status) && anonymousStaff.response.headers.get("location")?.includes("/login"),
  adminStaffVisible: adminStaff.response.ok && adminStaff.html.includes("Solicitudes de matriculación"),
  studentStaffRejected: [200, 404].includes(studentStaff.response.status)
    && !studentStaff.html.includes("Solicitudes de matriculaciÃ³n")
    && (studentStaff.html.includes("NEXT_HTTP_ERROR_FALLBACK;404") || studentStaff.html.includes("No encontramos esta pantalla")),
  loginHidesRequestUntilAccessIsDenied: login.response.ok && !login.html.includes("Solicitar matriculación"),
};
if (Object.values(checks).some((check) => !check)) throw new Error(`Falló la verificación de solicitudes: ${JSON.stringify({ checks, adminStatus: adminStaff.response.status, adminUrl: adminStaff.response.url, adminPreview: adminStaff.html.slice(0, 300) })}`);
outputJson({ checks });
