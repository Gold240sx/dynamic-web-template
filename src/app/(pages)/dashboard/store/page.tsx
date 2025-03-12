import { Suspense } from "react";
import StoreContent from "~/components/pages/store/store-content";

export const dynamic = "force-dynamic";

export default function DashboardStorePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <StoreContent />
    </Suspense>
  );
}
