"use client";

import { api } from "@/trpc/react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RouterOutputs } from "@/trpc/react";

type CompanyReview =
  RouterOutputs["companyReview"]["getApprovedReviews"][number];

export function ReviewsSection() {
  const { data: reviews, isLoading } =
    api.companyReview.getApprovedReviews.useQuery();

  if (isLoading) {
    return (
      <section className="bg-secondary w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                Loading Reviews...
              </h2>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!reviews?.length) {
    return null;
  }

  return (
    <section className="bg-secondary w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
              What Our Customers Say
            </h2>
            <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
              Don&apos;t just take our word for it. Here&apos;s what our
              customers have to say about their experience.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl gap-6 pt-12 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review: CompanyReview) => (
            <Card key={review.id} className="h-full">
              <CardContent className="flex flex-col gap-4 p-6">
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage
                      src={review.user.avatarUrl ?? ""}
                      alt={review.user.name ?? "User"}
                    />
                    <AvatarFallback>
                      {review.user.name
                        ?.split(" ")
                        .map((n: string) => n[0])
                        .join("") ?? "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <p className="font-semibold">{review.user.name}</p>
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            "h-4 w-4",
                            i < review.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "fill-gray-200 text-gray-200",
                          )}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-gray-500 dark:text-gray-400">
                  {review.content}
                </p>
                <p className="mt-auto text-sm text-gray-500 dark:text-gray-400">
                  {new Date(review.createdAt).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
