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

  if (typeof user?.billingAddress === "string") {
    try {
      user.billingAddress = JSON.parse(user.billingAddress);
    } catch (error) {
      console.error("Error parsing billing address:", error);
      user.billingAddress = null;
    }
  }

  return Response.json({ user });
}
