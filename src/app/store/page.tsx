import { StoreProvider } from "~/context/store-context";
import { StoreContent } from "~/components/store/store-content";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function StorePage() {
  return (
    <StoreProvider>
      <StoreContent />
    </StoreProvider>
  );
}
