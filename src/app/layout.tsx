import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "../providers/ThemeProvider";
import NextAuthSessionProvider from "../providers/SessionProvider";
import { ModalProvider } from "../providers/ModalProvider";
import Modal from "../components/ui/Modal/Modal";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kanban Task Manager",
  description:
    "A powerful and intuitive Kanban app to manage your tasks efficiently.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/icon-board.svg" sizes="32x32" />
      </head>
      <body className={`${plusJakartaSans.variable} font-sans`}>
        <ModalProvider ModalComponent={Modal}>
          <NextAuthSessionProvider>
            <ThemeProvider>{children}</ThemeProvider>
          </NextAuthSessionProvider>
        </ModalProvider>
      </body>
    </html>
  );
}
