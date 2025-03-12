import { notFound } from "next/navigation";
import { SubscriptionProductFormWrapper } from "./form.client";
import { createCaller } from "~/server/api/root";
import { createTRPCContext } from "~/server/api/trpc";

interface PageProps {
  params: {
    productId: string;
  };
}

export default async function Page({ params }: PageProps) {
  const caller = createCaller(
    await createTRPCContext({ headers: new Headers() }),
  );
  const product = await caller.subscription.getProduct({
    id: params.productId,
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
