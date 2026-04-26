import "./globals.css";
import ClientShell from "../components/ClientShell";

export const metadata = {
  title: "Nexum Suum Intelligence Portal",
  description: "Boiler · Chiller · Facility Systems Intelligence",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#001923]">
        <ClientShell>{children}</ClientShell>
      </body>
    </html>
  );
}
