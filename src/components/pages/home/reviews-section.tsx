"use client";

import { api } from "@/trpc/react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RouterOutputs } from "@/trpc/react";

type CompanyReview =
  RouterOutputs["companyReview"]["getApprovedReviews"][number];

function ReviewSkeleton() {
  return (
    <Card className="h-full animate-pulse">
      <CardContent className="flex flex-col gap-4 p-6">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-zinc-200 dark:bg-zinc-800" />
          <div className="flex flex-col gap-2">
            <div className="h-4 w-24 rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-4 w-4 rounded bg-zinc-200 dark:bg-zinc-800"
                />
              ))}
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-4 w-full rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-4 w-3/4 rounded bg-zinc-200 dark:bg-zinc-800" />
        </div>
        <div className="h-4 w-1/4 rounded bg-zinc-200 dark:bg-zinc-800" />
      </CardContent>
    </Card>
  );
}

export function ReviewsSection() {
  const { data: reviews, isLoading } =
    api.companyReview.getApprovedReviews.useQuery();

  if (isLoading) {
    return (
      <section className="w-full bg-secondary py-12 md:py-24 lg:py-32">
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
            {[...Array(6)].map((_, i) => (
              <ReviewSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!reviews?.length) {
    return null;
  }

  return (
    <section className="w-full bg-secondary py-12 md:py-24 lg:py-32">
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
                    <p className="font-semibold text-foreground">
                      {review.user.name}
                    </p>
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            "h-4 w-4",
                            i < review.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "fill-muted text-muted",
                          )}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-muted-foreground">{review.content}</p>
                <p className="mt-auto text-sm text-muted-foreground">
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
