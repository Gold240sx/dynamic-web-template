import { type Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { TRPCReactProvider } from "~/trpc/react";
import { Providers } from "./providers";
import { Toaster } from "sonner";
import { cn } from "~/lib/utils";

import "~/styles/globals.css";

export const metadata: Metadata = {
  title: "T3 Blog",
  description: "Simple blog built with the t3 stack",
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
          <Providers>
            {children}
            <Toaster />
          </Providers>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
