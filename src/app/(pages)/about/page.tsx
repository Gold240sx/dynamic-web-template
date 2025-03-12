import { Suspense } from "react";
import AboutContent from "@/components/pages/about/AboutContent";

export const dynamic = "force-dynamic";

export default function AboutPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AboutContent />
    </Suspense>
  );
}
