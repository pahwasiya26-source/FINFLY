import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "../components/ThemeProvider";
import { AppShell } from "../components/AppShell";
import { AuthProvider } from "../lib/auth/AuthContext";
import StyledJsxRegistry from "../components/StyledJsxRegistry";

export const metadata: Metadata = {
  title: "FINEXFLY — AI Finance Controller",
  description: "FINEXFLY is an AI Finance Controller for personal and business financial operations, reconciliation, insights, and decision intelligence.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8f9fc" },
    { media: "(prefers-color-scheme: dark)", color: "#07080b" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <StyledJsxRegistry>
          <ThemeProvider>
            <AuthProvider>
              {/* Global Dynamic Atmospheric Background */}
              <div className="dynamic-background" aria-hidden="true">
                <div className="bg-radial-layer" />
                <div className="bg-grid-overlay" />
                <div className="bg-glow-orb-1" />
                <div className="bg-glow-orb-2" />
              </div>

              <AppShell>{children}</AppShell>
            </AuthProvider>
          </ThemeProvider>
        </StyledJsxRegistry>
      </body>
    </html>
  );
}
