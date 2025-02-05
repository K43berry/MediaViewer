
import "./globals.css";
import NavBar from './components/NavBar'

import { Poppins } from "next/font/google";

const poppins = Poppins({ subsets: ["latin"], weight: ["400", "700"] });

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${poppins.className} bg-black`}>
        <div className="sticky top-0 overflow-hidden p-4 bg-black">
          <NavBar/>
        </div>
        {children}
      </body>
    </html>
  );
}
