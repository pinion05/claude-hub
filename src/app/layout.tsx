import type { Metadata } from "next";
import { Fira_Code } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { ErrorBoundary } from "@/components/organisms/ErrorBoundary";
import "./globals.css";

const firaCode = Fira_Code({
  variable: "--font-fira-code",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Claude Hub - Discover Extensions for Claude",
  description: "Explore and discover extensions, tools, and integrations for Claude AI",
  keywords: ["Claude", "AI", "Extensions", "Tools", "Integrations", "Plugins"],
  authors: [{ name: "Claude Hub Team" }],
  openGraph: {
    title: "Claude Hub - Discover Extensions for Claude",
    description: "Explore and discover extensions, tools, and integrations for Claude AI",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${firaCode.variable} antialiased`}
      >
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
        <Analytics />
      </body>
    </html>
  );
}
