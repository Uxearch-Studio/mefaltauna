import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/vintage/Logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="border-b border-border">
        <div className="mx-auto max-w-6xl px-6 h-16 flex items-center">
          <Link href="/" className="hover:opacity-70 transition-opacity">
            <Logo />
          </Link>
        </div>
      </div>
      {children}
    </>
  );
}
