import PocketBase from 'pocketbase';
import { cookies } from 'next/headers';

import { User } from '@/types';

// Server-side helper to get authenticated instance
export async function createServerClient() {
  const cookieStore = await cookies();
  const token = cookieStore.get('pb_auth')?.value;

  const serverPb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);
  
  if (token) {
    serverPb.authStore.loadFromCookie(`pb_auth=${token}`);
  }

  return serverPb;
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
