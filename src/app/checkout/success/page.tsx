import { Suspense } from "react";
import SuccessContent from "./success-content";

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center bg-white text-center dark:bg-zinc-950">
          <div className="mx-auto max-w-2xl px-4">
            <h1 className="mb-4 text-4xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Loading...
            </h1>
          </div>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
