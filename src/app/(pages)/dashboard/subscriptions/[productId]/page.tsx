import { notFound } from "next/navigation";
import { SubscriptionProductFormWrapper } from "./form.client";
import { createCaller } from "~/server/api/root";
import { createTRPCContext } from "~/server/api/trpc";

export default async function Page(props: any) {
  const { productId } = props.params;

  const caller = createCaller(
    await createTRPCContext({ headers: new Headers() }),
  );
  const product = await caller.subscription.getProduct({ id: productId });

  if (!product) {
    notFound();
  }

  return (
    <div className="container mx-auto py-10">
      <SubscriptionProductFormWrapper initialData={product} />
    </div>
  );
}
