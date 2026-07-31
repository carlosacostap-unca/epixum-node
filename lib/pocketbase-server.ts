import PocketBase from 'pocketbase';
import { cookies } from 'next/headers';

import { User } from '@/types';

// Server-side helper to get authenticated instance
export async function createServerClient() {
  const cookieStore = await cookies();
  const token = cookieStore.get('pb_auth')?.value;

  // Access via bracket notation to prevent build-time inlining and ensure runtime access
  const url = process.env['NEXT_PUBLIC_POCKETBASE_URL'];
  
  if (!url) {
    console.error("CRITICAL ERROR: NEXT_PUBLIC_POCKETBASE_URL is not set in the server environment.");
  }

  const serverPb = new PocketBase(url);
  
  if (token) {
    serverPb.authStore.loadFromCookie(`pb_auth=${token}`);
    if (serverPb.authStore.isValid) {
      try {
        await serverPb.collection('users').authRefresh({ requestKey: null });
      } catch {
        serverPb.authStore.clear();
      }
    }
  }

  return serverPb;
}

export async function createAdminServerClient() {
  const url = process.env['NEXT_PUBLIC_POCKETBASE_URL'];
  const email = process.env['POCKETBASE_ADMIN_EMAIL'];
  const password = process.env['POCKETBASE_ADMIN_PASSWORD'];
  if (!url || !email || !password) {
    throw new Error("Falta la configuración administrativa de PocketBase en el servidor.");
  }
  const adminPb = new PocketBase(url);
  adminPb.autoCancellation(false);
  await adminPb.collection('_superusers').authWithPassword(email, password, { requestKey: null });
  return adminPb;
}

export async function getCurrentUser() {
  const pb = await createServerClient();
  if (!pb.authStore.isValid) return null;
  try {
    return pb.authStore.model as unknown as User;
  } catch (e) {
    return null;
  }
}
