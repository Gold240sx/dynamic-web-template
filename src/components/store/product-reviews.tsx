"use client";

import { useTransition } from "react";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";
import { useAuth } from "~/hooks/use-auth";
import { toast } from "sonner";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { formatDistanceToNow } from "date-fns";
import { Star } from "lucide-react";

interface ProductReviewsProps {
  productId: string;
}

export function ProductReviews({ productId }: ProductReviewsProps) {
  const [isPending, startTransition] = useTransition();
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(5);
  const router = useRouter();
  const { user } = useAuth();

  const { data: reviews } = api.productReview.getByProductId.useQuery(
    { productId },
    { refetchInterval: 30000 }, // Refetch every 30 seconds
  );

  const { mutate: createReview } = api.productReview.create.useMutation({
    onSuccess: () => {
      setContent("");
      setRating(5);
      startTransition(() => {
        router.refresh();
      });
      toast.success("Review submitted for approval");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("You must be logged in to review products");
      return;
    }

    if (!content.trim()) {
      toast.error("Review cannot be empty");
      return;
    }

    createReview({ productId, content: content.trim(), rating });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Reviews</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setRating(i + 1)}
              className="focus:outline-none"
              disabled={!user || isPending}
            >
              <Star
                className={`h-6 w-6 ${
                  i < rating
                    ? "fill-current text-yellow-400"
                    : "text-muted-foreground"
                }`}
              />
            </button>
          ))}
        </div>
        <Textarea
          placeholder="Write a review..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={!user || isPending}
        />
        <Button type="submit" disabled={!user || isPending}>
          Submit Review
        </Button>
      </form>

      <div className="space-y-4">
        {reviews?.map((review) => (
          <div key={review.id} className="flex gap-4">
            <Avatar>
              <AvatarImage
                src={
                  (review.user as { avatarUrl: string | null }).avatarUrl ??
                  undefined
                }
              />
              <AvatarFallback>
                {(review.user as { name: string | null }).name
                  ?.slice(0, 2)
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold">
                  {(review.user as { name: string | null }).name ??
                    "Unknown User"}
                </span>
                <div className="flex items-center gap-1">
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-current text-yellow-400"
                    />
                  ))}
                </div>
                <span className="text-muted-foreground text-sm">
                  {formatDistanceToNow(new Date(review.createdAt), {
                    addSuffix: true,
                  })}
                </span>
              </div>
              <p className="text-muted-foreground mt-1">{review.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
