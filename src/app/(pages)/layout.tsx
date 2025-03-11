import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { TRPCReactProvider } from "~/trpc/react";
import { StoreProvider } from "~/context/store-context";
import { Navigation } from "~/components/navigation";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Toaster } from "~/components/ui/toaster";

export const metadata = {
  title: "T3 Store",
  description: "A modern e-commerce store built with the T3 Stack",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable}`}>
        <TRPCReactProvider>
          <StoreProvider>
            <Navigation />
            <NuqsAdapter>{children}</NuqsAdapter>
            <Toaster />
          </StoreProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
