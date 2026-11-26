import type { Metadata } from "next";

import { TRPCReactProvider } from "@/trpc/client";
import "@/env";

import "./globals.css";

export const metadata: Metadata = {
  title: "KriyZen — A calmer workspace",
  description: "A thoughtful workspace for email and calendar.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <TRPCReactProvider>{children}</TRPCReactProvider>
      </body>
    </html>
  );
}
