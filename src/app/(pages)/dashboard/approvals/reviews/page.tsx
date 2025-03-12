"use client";

import { Suspense } from "react";
import { useTransition } from "react";
import { api } from "~/trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Star } from "lucide-react";
import type { RouterOutputs } from "~/trpc/shared";
import type { productReviews } from "~/server/db/schema";
import type { InferSelectModel } from "drizzle-orm";

type ReviewUser = {
  id: string;
  name: string | null;
  avatarUrl: string | null;
};

type ProductReview = {
  id: string;
  content: string;
  rating: number;
  createdAt: Date;
  isApproved: boolean;
  user: ReviewUser;
  product: {
    id: string;
    name: string;
  };
};

type CompanyReview = {
  id: string;
  content: string;
  rating: number;
  createdAt: Date;
  isApproved: boolean;
  user: ReviewUser;
};

type ProductReviewWithRelations =
  RouterOutputs["product"]["getPendingReviews"][number];
type CompanyReviewWithRelations =
  RouterOutputs["company"]["getPendingReviews"][number];

function PendingReviews() {
  const [isPending, startTransition] = useTransition();
  const utils = api.useContext();

  const { data: productReviews = [], isLoading: isLoadingProductReviews } =
    api.product.getPendingReviews.useQuery() as unknown as {
      data: ProductReview[];
      isLoading: boolean;
    };
  const { data: companyReviews = [], isLoading: isLoadingCompanyReviews } =
    api.company.getPendingReviews.useQuery() as unknown as {
      data: CompanyReview[];
      isLoading: boolean;
    };

  const { mutate: updateProductReview } = api.product.updateReview.useMutation({
    onSuccess: () => {
      startTransition(() => {
        void utils.product.getPendingReviews.invalidate();
      });
      toast.success("Product review status updated");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const { mutate: updateCompanyReview } = api.company.updateReview.useMutation({
    onSuccess: () => {
      startTransition(() => {
        void utils.company.getPendingReviews.invalidate();
      });
      toast.success("Company review status updated");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  if (isLoadingProductReviews || isLoadingCompanyReviews) {
    return <div>Loading pending reviews...</div>;
  }

  return (
    <Tabs defaultValue="product" className="w-full">
      <TabsList>
        <TabsTrigger value="product">Product Reviews</TabsTrigger>
        <TabsTrigger value="company">Company Reviews</TabsTrigger>
      </TabsList>

      <TabsContent value="product" className="space-y-4">
        {!productReviews?.length ? (
          <div className="text-muted-foreground text-center">
            No pending product reviews to review.
          </div>
        ) : (
          productReviews.map((review) => (
            <Card key={review.id}>
              <CardHeader>
                <CardTitle className="text-lg">
                  Review for: {review.product.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <Avatar>
                    <AvatarImage src={review.user.avatarUrl ?? undefined} />
                    <AvatarFallback>
                      {review.user.name?.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{review.user.name}</span>
                      <span className="text-muted-foreground text-sm">
                        {formatDistanceToNow(new Date(review.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-1">
                      {Array.from({ length: review.rating }).map((_, i) => (
                        <Star
                          key={i}
                          className="h-4 w-4 fill-yellow-400 text-yellow-400"
                        />
                      ))}
                    </div>
                    <p className="text-muted-foreground mt-1">
                      {review.content}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="default"
                    onClick={() =>
                      updateProductReview({ id: review.id, isApproved: true })
                    }
                    disabled={isPending}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() =>
                      updateProductReview({ id: review.id, isApproved: false })
                    }
                    disabled={isPending}
                  >
                    Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </TabsContent>

      <TabsContent value="company" className="space-y-4">
        {!companyReviews?.length ? (
          <div className="text-muted-foreground text-center">
            No pending company reviews to review.
          </div>
        ) : (
          companyReviews.map((review) => (
            <Card key={review.id}>
              <CardHeader>
                <CardTitle className="text-lg">Company Review</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <Avatar>
                    <AvatarImage src={review.user.avatarUrl ?? undefined} />
                    <AvatarFallback>
                      {review.user.name?.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{review.user.name}</span>
                      <span className="text-muted-foreground text-sm">
                        {formatDistanceToNow(new Date(review.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-1">
                      {Array.from({ length: review.rating }).map((_, i) => (
                        <Star
                          key={i}
                          className="h-4 w-4 fill-yellow-400 text-yellow-400"
                        />
                      ))}
                    </div>
                    <p className="text-muted-foreground mt-1">
                      {review.content}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="default"
                    onClick={() =>
                      updateCompanyReview({ id: review.id, isApproved: true })
                    }
                    disabled={isPending}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() =>
                      updateCompanyReview({ id: review.id, isApproved: false })
                    }
                    disabled={isPending}
                  >
                    Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </TabsContent>
    </Tabs>
  );
}

export default function ReviewsApprovalPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-8 text-3xl font-bold">Pending Reviews</h1>
      <Suspense fallback={<div>Loading...</div>}>
        <PendingReviews />
      </Suspense>
    </div>
  );
}
