import { Suspense } from "react";
import SignInContent from "../../../components/pages/sign-in/signin-content";

export const dynamic = "force-dynamic";

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto flex h-screen items-center justify-center">
          <div className="w-[400px] animate-pulse space-y-4">
            <div className="h-8 w-1/3 rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-4 w-2/3 rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="space-y-4">
              <div className="h-10 rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-10 rounded bg-zinc-200 dark:bg-zinc-800" />
            </div>
          </div>
        </div>
      }
    >
      <SignInContent />
    </Suspense>
  );
}
