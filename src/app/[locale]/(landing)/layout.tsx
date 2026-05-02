import { Header } from "@/components/vintage/Header";
import { Footer } from "@/components/vintage/Footer";

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}
