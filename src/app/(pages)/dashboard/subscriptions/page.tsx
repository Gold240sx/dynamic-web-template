"use client";

import { Suspense } from "react";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { api } from "~/trpc/react";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { formatCurrency } from "~/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { toast } from "sonner";
import { Badge } from "~/components/ui/badge";

export const dynamic = "force-dynamic";

function SubscriptionsPageContent() {
  const router = useRouter();
  const utils = api.useUtils();
  const { data: products, isLoading } =
    api.subscription.getAllProducts.useQuery();

  const sortedProducts = products?.sort(
    (a, b) => a.prices[0]?.unitAmount - b.prices[0]?.unitAmount,
  );

  const { mutate: deleteProduct } = api.subscription.deleteProduct.useMutation({
    onSuccess: () => {
      toast.success("Product deleted successfully");
      void utils.subscription.getAllProducts.invalidate();
    },
    onError: (error) => {
      toast.error(`Error deleting product: ${error.message}`);
    },
  });

  return (
    <div className="container py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-4xl font-bold">Subscription Products</h1>
        <Button onClick={() => router.push("/dashboard/subscriptions/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Products</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 text-center">Loading...</div>
          ) : !products?.length ? (
            <div className="py-8 text-center">
              No subscription products found.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="min-w-[160px]">Prices</TableHead>
                  <TableHead className="w-[160px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedProducts?.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{product.description}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                          product.active
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {product.active ? "Active" : "Inactive"}
                      </span>
                    </TableCell>
                    <TableCell>
                      {product.prices?.map((price) => (
                        <div
                          key={price.id}
                          className="mb-2 flex items-center gap-2"
                        >
                          <div>
                            {formatCurrency(price.unitAmount)} /{" "}
                            {price.interval}
                          </div>
                          {price.includesTrial && (
                            <Badge variant="secondary" className="text-xs">
                              {price.trialLength} {price.trialUnit} trial
                            </Badge>
                          )}
                        </div>
                      ))}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            router.push(
                              `/dashboard/subscriptions/${product.id}`,
                            )
                          }
                        >
                          Edit
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="destructive"
                              size="sm"
                              className="h-9 w-9 p-0"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Delete {product.name}?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                This will archive the product and all its prices
                                in Stripe. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() =>
                                  deleteProduct({ id: product.id })
                                }
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function SubscriptionsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[400px] w-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <SubscriptionsPageContent />
    </Suspense>
  );
}
