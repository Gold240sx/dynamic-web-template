// import { notFound } from "next/navigation";
// import { api } from "~/trpc/server";
// import { OrderDetails } from "@/app/dashboard/orders/[orderId]/order-details";
import { Suspense } from "react";

// async function OrderDetailsContent({ orderId }: { orderId: string }) {
//   const order = await api.order.getById({ id: orderId });

//   if (!order) {
//     notFound();
//   }

//   return <p>Hello. This is the order #{orderId}</p>;
//   // return <OrderDetails order={order} />;
// }

export default function OrderDetailsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      {/* <OrderDetailsContent orderId={params.orderId} /> */}
      {/* <p>Hello. This is the order #{params.orderId}</p> */}
      Hello
    </Suspense>
  );
}
