"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./footer";
import ConnectingDotsBackground from "./bg";
import PageLoaderWrapper from "./PageLoaderWrapper";

export default function LayoutShell({ children }) {
  const pathname = usePathname();
  const isFreshersPage = pathname?.startsWith("/freshers");

  return (
    <>
      <PageLoaderWrapper />
      <Navbar />
      {!isFreshersPage && <ConnectingDotsBackground />}
      {children}
      <Footer />
    </>
  );
}
