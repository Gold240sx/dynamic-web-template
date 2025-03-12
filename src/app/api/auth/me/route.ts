import { db } from "@/server/db";
import { users } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { getCookie } from "@/lib/cookies";

export async function GET() {
  const userId = await getCookie("userId");

  if (!userId) {
    return Response.json({ user: null });
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, userId.value),
  });

  return Response.json({ user });
}
