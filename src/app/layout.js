import "./globals.css";
import LayoutShell from "./components/LayoutShell";
import SessionProvider from "./components/SessionProvider";
import PixelCanvas from "./components/PixelCanvas";
import { Bangers, Rajdhani, Orbitron } from "next/font/google";

const bangers = Bangers({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bangers",
});

const rajdhani = Rajdhani({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-rajdhani",
});

const orbitron = Orbitron({
  weight: ["400", "700", "900"],
  subsets: ["latin"],
  variable: "--font-orbitron",
});

export const metadata = {
  title: "RC NITW",
  description: "Robotics Club NITW Official Website",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${bangers.variable} ${rajdhani.variable} ${orbitron.variable} bg-black`}>
        <PixelCanvas />
        <SessionProvider>
          <LayoutShell>{children}</LayoutShell>
        </SessionProvider>
      </body>
    </html>
  );
}
