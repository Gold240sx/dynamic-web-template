import PublicNavbar from "~/components/PublicNavbar";

export default function PageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <PublicNavbar />
      {children}
    </div>
  );
}
