import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "../providers/ThemeProvider";
import NextAuthSessionProvider from "../providers/SessionProvider";
import { ModalProvider } from "../providers/ModalProvider";
import { DragDropProvider } from "../providers/DragDropProvider";
import Modal from "../components/ui/Modal/Modal";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta-sans",
  subsets: ["latin"],
});

const appName = "Kanban Task Manager";
const siteDescription =
  "A powerful and intuitive Kanban app to manage your tasks efficiently.";
const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  applicationName: appName,
  title: {
    default: appName,
    template: "%s | Kanban",
  },
  description: siteDescription,
  keywords: [
    "kanban",
    "task manager",
    "project management",
    "productivity",
    "boards",
    "tasks",
    "columns",
  ],
  authors: [{ name: "Kanban Team" }],
  creator: "Kanban Team",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Kanban",
    title: appName,
    description: siteDescription,
    images: [
      {
        url: "/icon-board.svg",
        width: 1200,
        height: 630,
        alt: "Kanban Task Manager",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: appName,
    description: siteDescription,
    images: ["/icon-board.svg"],
  },
  icons: {
    icon: [{ url: "/icon-board.svg", sizes: "32x32", type: "image/svg+xml" }],
    shortcut: ["/icon-board.svg"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#111827" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${plusJakartaSans.variable} font-sans`}>
        <ModalProvider ModalComponent={Modal}>
          <NextAuthSessionProvider>
            <DragDropProvider>
              <ThemeProvider>{children}</ThemeProvider>
            </DragDropProvider>
          </NextAuthSessionProvider>
        </ModalProvider>
      </body>
    </html>
  );
}
