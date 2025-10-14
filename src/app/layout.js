import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/footer";
import ConnectingDotsBackground from "./components/bg";


export const metadata = {
  title: "RC NITW",
  description: "Robotics Club NITW Official Website",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-black">
        <Navbar />
        <ConnectingDotsBackground />
        {children}
        <Footer />
      </body>
    </html>
  );
}
