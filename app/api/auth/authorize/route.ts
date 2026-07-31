import { NextResponse } from "next/server";
import { authorizeCurrentOAuthUser } from "@/lib/cohorts/oauth";

export async function POST() {
  try {
    const result = await authorizeCurrentOAuthUser();
    if (!result.authorized) {
      const response = NextResponse.json(result, { status: 403 });
      response.cookies.set("pb_auth", "", { path: "/", maxAge: 0 });
      return response;
    }
    return NextResponse.json(result);
  } catch (error) {
    const response = NextResponse.json({ authorized: false, error: error instanceof Error ? error.message : "No se pudo validar el acceso." }, { status: 401 });
    response.cookies.set("pb_auth", "", { path: "/", maxAge: 0 });
    return response;
  }
}
