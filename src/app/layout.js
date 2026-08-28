import "./globals.css";
import LayoutShell from "./components/LayoutShell";
import SessionProvider from "./components/SessionProvider";
import { Bangers, Nunito } from "next/font/google";

const bangers = Bangers({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bangers",
});

const nunito = Nunito({
  weight: ["400", "600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-nunito",
});

export const metadata = {
  title: "RC NITW",
  description: "Robotics Club NITW Official Website",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${bangers.variable} ${nunito.variable} bg-black`}>
        <SessionProvider>
          <LayoutShell>{children}</LayoutShell>
        </SessionProvider>
      </body>
    </html>
  );
}
