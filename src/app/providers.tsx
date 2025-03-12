"use client";

import { type ReactNode } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Suspense } from "react";

function ProvidersContent({ children }: { children: ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  return children;
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <Suspense>
      <ProvidersContent>{children}</ProvidersContent>
    </Suspense>
  );
}
