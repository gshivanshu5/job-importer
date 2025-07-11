import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Artha Job Board",
  description: "A platform for job seekers and employers",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <nav className="bg-gray-900 p-4 text-white flex gap-4">
          <Link href="/" className="hover:underline">Dashboard</Link>
          <Link href="/jobs" className="hover:underline">Jobs</Link>
        </nav>
        {children}
        <ToastContainer position="top-right" autoClose={3000} />
      </body>
    </html>
  );
}
