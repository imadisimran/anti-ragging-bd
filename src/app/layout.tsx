import { Inter } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/providers/AuthProvider";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata = {
  title: "Anti-Ragging BD",
  description: "A Website for Anti Ragging",
};

export default async function RootLayout({ children }:{children:React.ReactNode}) {
  const session = await getServerSession(authOptions);
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
      data-theme="justice-safety"
    >
      <body className="min-h-full flex flex-col bg-background text-on-background"><AuthProvider session={session}>{children}</AuthProvider></body>
    </html>
  );
}
