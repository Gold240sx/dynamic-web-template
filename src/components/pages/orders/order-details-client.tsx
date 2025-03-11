"use client";

import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import { formatDate } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { Printer, Download } from "lucide-react";

interface OrderDetailsClientProps {
  orderId: string;
}

export default function OrderDetailsClient({
  orderId,
}: OrderDetailsClientProps) {
  const router = useRouter();
  const { data: order, isLoading } = api.order.getById.useQuery({
    id: orderId,
  });

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    const filename = `order-${orderId}.pdf`;

    // Use the browser's print functionality with PDF preset
    const mediaQueryList = window.matchMedia("print");
    const handler = () => {
      // Remove listener once printing is done
      mediaQueryList.removeEventListener("change", handler);
      // Reset the title
      document.title = originalTitle;
    };

    // Set up listener for print completion
    mediaQueryList.addEventListener("change", handler);

    // Store original title
    const originalTitle = document.title;
    // Set filename as title (some browsers use this as default filename)
    document.title = filename;

    window.print();
  };

  if (isLoading) return <div>Loading...</div>;
  if (!order) return <div>Order not found</div>;

  return (
    <div className="container mx-auto p-8 py-8">
      <div className="mb-8 flex items-center justify-between print:!hidden">
        <button
          onClick={() => router.back()}
          className="text-blue-600 hover:underline"
        >
          ← Back to Orders
        </button>
        <div className="flex gap-2">
          <Button onClick={handleDownloadPDF} variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
          <Button onClick={handlePrint} variant="outline" size="sm">
            <Printer className="mr-2 h-4 w-4" />
            Print Order
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Order Details</h1>
            <p className="text-zinc-600">Order ID: {order.id}</p>
            <p className="text-zinc-600">
              Date: {formatDate(new Date(order.createdAt))}
            </p>
          </div>
          <div className="hidden text-right print:block">
            <h2 className="text-xl font-semibold">Your Store Name</h2>
            <p className="text-zinc-600">123 Store Street</p>
            <p className="text-zinc-600">City, State 12345</p>
          </div>
        </div>

        <div className="grid gap-6 md:flex">
          <div className="flex-1">
            <h2 className="mb-2 text-xl font-semibold">Customer Information</h2>
            <p>Name: {order.customerName}</p>
            <p>Email: {order.customerEmail}</p>
            {order.customerPhone && <p>Phone: {order.customerPhone}</p>}
          </div>

          {order.requiresShipping && (
            <div className="md:justify-self-end">
              <div className="text-left">
                <h2 className="mb-2 text-xl font-semibold">Shipping Address</h2>
                <p>{order.shippingName}</p>
                <p>{order.shippingAddressLine1}</p>
                {order.shippingAddressLine2 && (
                  <p>{order.shippingAddressLine2}</p>
                )}
                <p>
                  {order.shippingCity}, {order.shippingState}{" "}
                  {order.shippingPostalCode}
                </p>
                <p>{order.shippingCountry}</p>
              </div>
            </div>
          )}
        </div>

        <div>
          <h2 className="mb-2 text-xl font-semibold">Order Items</h2>
          <div className="rounded-md border print:border-black">
            <table className="w-full">
              <thead>
                <tr className="border-b text-sm print:border-black">
                  <th className="p-4 text-left font-medium">Item</th>
                  <th className="p-4 text-left font-medium">Quantity</th>
                  <th className="p-4 text-left font-medium">Price</th>
                  <th className="p-4 text-left font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item) => (
                  <tr key={item.id} className="border-b print:border-black">
                    <td className="p-4">{item.name}</td>
                    <td className="p-4">{item.quantity}</td>
                    <td className="p-4">
                      ${(item.unitPrice / 100).toFixed(2)}
                    </td>
                    <td className="p-4">${(item.subtotal / 100).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex w-full justify-end">
          <div className="w-full max-w-xs space-y-2">
            <div className="flex justify-between gap-8">
              <span>Subtotal</span>
              <span>${(order.amountSubtotal / 100).toFixed(2)}</span>
            </div>
            <div className="flex justify-between gap-8">
              <span>Shipping</span>
              <span>${(order.amountShipping / 100).toFixed(2)}</span>
            </div>
            <div className="flex justify-between gap-8">
              <span>Tax</span>
              <span>${(order.amountTax / 100).toFixed(2)}</span>
            </div>
            <div className="flex justify-between gap-8 border-t pt-2 font-semibold print:border-black">
              <span>Total</span>
              <span>${(order.amountTotal / 100).toFixed(2)}</span>
            </div>
          </div>
        </div>

        <style jsx global>{`
          @media print {
            @page {
              margin: 20mm;
            }
            body {
              print-color-adjust: exact;
              -webkit-print-color-adjust: exact;
            }
          }
        `}</style>
      </div>
    </div>
  );
}
