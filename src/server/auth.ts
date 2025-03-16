import { cookies } from "next/headers";
import { db } from "~/server/db";
import { eq } from "drizzle-orm";
import { users } from "~/server/db/schema";

export interface Session {
  user: {
    id: string;
    name: string | null;
    email: string;
    role: "admin" | "user";
  } | null;
}

export async function getServerAuthSession(): Promise<Session> {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId");

  if (!userId?.value) {
    return { user: null };
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, userId.value),
  });

  if (!user) {
    return { user: null };
  }

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
}
