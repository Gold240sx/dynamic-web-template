import { db } from "@/server/db";
import { users } from "@/server/db/schema";
import type { User } from "@/server/db/types";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { createId } from "@paralleldrive/cuid2";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { z } from "zod";

const signInSchema = z.object({
  email: z.string(),
  password: z.string(),
  redirectTo: z.string().default("/dashboard"),
});

type SignInRequest = z.infer<typeof signInSchema>;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SignInRequest;
    console.log("Request body:", { ...body, password: "[REDACTED]" });

    const result = signInSchema.safeParse(body);

    if (!result.success) {
      console.log("Validation failed:", result.error);
      return Response.json(
        { error: "Email and password are required" },
        { status: 400 },
      );
    }

    const { email, password, redirectTo } = result.data;

    // Find the user
    const [user] = await db.select().from(users).where(eq(users.email, email));

    console.log(
      "Found user:",
      user ? { ...user, password: "[REDACTED]" } : null,
    );

    if (!user?.password) {
      return Response.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    console.log("Password valid:", isValidPassword);

    if (!isValidPassword) {
      return Response.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Set a simple session cookie
    const response = new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });

    response.headers.append(
      "Set-Cookie",
      `userId=${user.id}; HttpOnly; Path=/; SameSite=Lax${
        process.env.NODE_ENV === "production" ? "; Secure" : ""
      }`,
    );

    return response;
  } catch (error) {
    console.error("Sign-in error:", error);
    return Response.json(
      { error: "An error occurred during sign in" },
      { status: 500 },
    );
  }
}
