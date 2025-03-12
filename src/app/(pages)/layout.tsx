import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { TRPCReactProvider } from "~/trpc/react";
import { StoreProvider } from "~/context/store-context";
import { Navigation } from "~/components/navigation";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Toaster } from "sonner";
import { Providers } from "../providers";
import { cn } from "~/lib/utils";
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "T3 Blog & Store",
  description: "A modern blog and e-commerce store built with the T3 Stack",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn("font-sans", GeistSans.variable)}
        suppressHydrationWarning
      >
        <TRPCReactProvider>
          <StoreProvider>
            <Providers>
              <Navigation />
              <NuqsAdapter>{children}</NuqsAdapter>
              <Toaster />
            </Providers>
          </StoreProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
