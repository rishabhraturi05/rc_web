import "./globals.css";
import LayoutShell from "./components/LayoutShell";
import SessionProvider from "./components/SessionProvider";
import { Bangers, Rajdhani, Orbitron } from "next/font/google";

const bangers = Bangers({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bangers",
});

// Using Rajdhani as the main body/tech font, hijacking the --font-nunito variable 
// to instantly upgrade the whole site's typography without breaking classes
const rajdhani = Rajdhani({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-nunito", 
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

import PixelCanvas from "./components/PixelCanvas";

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
