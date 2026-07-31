export const IMPORT_HEADERS = ["nombre_completo", "email", "dni", "fecha_nacimiento", "telefono"];

export function normalizeAdmissionRow(headers, row) {
  const positions = new Map(headers.map((header, index) => [String(header ?? "").replace(/^\ufeff/, "").trim(), index]));
  const missing = IMPORT_HEADERS.filter((header) => !positions.has(header));
  if (missing.length) throw new Error(`Faltan columnas requeridas: ${missing.join(", ")}.`);
  const value = (header) => String(row[positions.get(header)] ?? "").trim();
  const displayName = value("nombre_completo").replace(/\s+/g, " ");
  const email = value("email").toLowerCase();
  const dni = value("dni");
  const birthDate = value("fecha_nacimiento");
  const phone = value("telefono");
  if (displayName.length < 2 || displayName.length > 160) throw new Error("Nombre completo inválido.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error(`Correo inválido: ${email || "vacío"}.`);
  if (dni.length > 32) throw new Error(`DNI demasiado largo para ${email}.`);
  if (birthDate && !/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) throw new Error(`Fecha de nacimiento inválida para ${email}.`);
  if (phone.length > 50) throw new Error(`Teléfono demasiado largo para ${email}.`);
  return { displayName, email, dni, birthDate, phone };
}
