import { createAdminClient } from "./client.mjs";

const pb = await createAdminClient();
const admin = await pb.collection("users").getFirstListItem('role = "admin"');
const session = await pb.collection("users").impersonate(admin.id, 300);
const serialized = session.authStore.exportToCookie({ httpOnly: true, secure: false, sameSite: "Lax", path: "/" });
process.stdout.write(serialized.slice(serialized.indexOf("=") + 1, serialized.indexOf(";")));
