import { Inter } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/providers/AuthProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata = {
  title: "Anti-Ragging BD",
  description: "A Website for Anti Ragging",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
      data-theme="winter"
    >
      <body className="min-h-full flex flex-col bg-base-100 text-base-content"><AuthProvider>{children}</AuthProvider></body>
    </html>
  );
}
