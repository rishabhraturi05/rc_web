import "./globals.css";
import LayoutShell from "./components/LayoutShell";
import SessionProvider from "./components/SessionProvider";
import PixelCanvas from "./components/PixelCanvas";

export const metadata = {
  title: "RC NITW",
  description: "Robotics Club NITW Official Website",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-black">
        <PixelCanvas />
        <SessionProvider>
          <LayoutShell>{children}</LayoutShell>
        </SessionProvider>
      </body>
    </html>
  );
}
