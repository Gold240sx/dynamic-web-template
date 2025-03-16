"use client";

import { type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Suspense } from "react";
import { ThemeProvider } from "~/components/theme-provider";

function ProvidersContent({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  return children;
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <Suspense>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <ProvidersContent>{children}</ProvidersContent>
      </ThemeProvider>
    </Suspense>
  );
}
