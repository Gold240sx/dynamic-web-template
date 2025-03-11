import { Suspense } from "react";
import Link from "next/link";

export default function NotFoundPage() {
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
      <div className="container mx-auto flex h-screen items-center justify-center">
        <div className="w-[400px] text-center">
          <h1 className="mb-4 text-4xl font-bold">404</h1>
          <p className="mb-8 text-lg text-zinc-600 dark:text-zinc-400">
            The page you&apos;re looking for doesn&apos;t exist.
          </p>
          <Link
            href={"/"}
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Go back
          </Link>
        </div>
      </div>
    </Suspense>
  );
}
