import { notFound } from "next/navigation";
import { SubscriptionProductFormWrapper } from "./form.client";
import { createCaller } from "~/server/api/root";
import { createTRPCContext } from "~/server/api/trpc";

export const dynamic = "force-dynamic";

export default async function SubscriptionProductPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;

  const caller = createCaller(
    await createTRPCContext({ headers: new Headers() }),
  );
  const product = await caller.subscription.getProduct({
    id: productId,
  });

  if (!product) {
    notFound();
  }

  return (
    <div className="container mx-auto py-10">
      <SubscriptionProductFormWrapper initialData={product} />
    </div>
  );
}
