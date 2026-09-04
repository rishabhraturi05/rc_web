"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./footer";
import PageLoader from "./PageLoader";

export default function LayoutShell({ children }) {
  const pathname = usePathname();

  return (
    <>
      <PageLoader />
      <Navbar />
      {children}
      <Footer />
    </>
  );
}
