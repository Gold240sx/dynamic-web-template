import { Suspense } from "react";
import OrdersContent from "~/components/pages/orders/orders-content";

export const dynamic = "force-dynamic";

export default function OrdersPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OrdersContent />
    </Suspense>
  );
}
