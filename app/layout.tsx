import "./globals.css";
import NavBar from "../components/NavBar";

export const metadata = {
  title: "Nexum Suum Intelligence Portal",
  description: "Boiler · Chiller · Facility Systems Intelligence",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#020810] text-gray-100 min-h-screen">
        <NavBar />
        <div className="pt-16">
          {children}
        </div>
      </body>
    </html>
  );
}
