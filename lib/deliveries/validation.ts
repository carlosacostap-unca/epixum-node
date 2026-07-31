export type RepositoryUrlValidation =
  | { success: true; value: string }
  | { success: false; error: string };

export function validateRepositoryUrl(rawValue: string): RepositoryUrlValidation {
  const value = rawValue.trim();
  if (!value) return { success: false, error: "Ingresá la URL del repositorio." };
  if (value.length > 2048) return { success: false, error: "La URL es demasiado larga." };

  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    return { success: false, error: "Ingresá una URL completa, por ejemplo https://github.com/usuario/proyecto." };
  }

  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    return { success: false, error: "La URL debe comenzar con https:// o http://." };
  }
  if (!parsed.hostname || parsed.username || parsed.password) {
    return { success: false, error: "Ingresá una URL de repositorio válida y sin credenciales." };
  }
  if (parsed.pathname === "/" || !parsed.pathname) {
    return { success: false, error: "La URL debe apuntar a un repositorio específico, no sólo al sitio." };
  }

  return { success: true, value: parsed.toString() };
}
