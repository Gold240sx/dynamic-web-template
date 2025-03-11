import { deleteCookie } from "@/lib/cookies";
import { redirect } from "next/navigation";

export async function POST() {
  await deleteCookie("userId");
  redirect("/");
}
