"use client";

import { useTransition } from "react";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";
import { useAuth } from "~/hooks/use-auth";
import { toast } from "sonner";
import { Heart } from "lucide-react";

interface PostLikeButtonProps {
  postId: number;
  initialLikes: number;
  initialLiked: boolean;
}

export function PostLikeButton({
  postId,
  initialLikes,
  initialLiked,
}: PostLikeButtonProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { user } = useAuth();

  const { data: likeStatus } = api.post.getLikeStatus.useQuery(
    { postId },
    { initialData: { liked: initialLiked } },
  );

  const { mutate: toggleLike } = api.post.toggleLike.useMutation({
    onSuccess: () => {
      startTransition(() => {
        router.refresh();
      });
      toast.success(likeStatus?.liked ? "Post unliked" : "Post liked");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return (
    <Button
      variant="ghost"
      size="sm"
      className="flex items-center gap-1"
      onClick={() => {
        if (!user) {
          toast.error("You must be logged in to like posts");
          return;
        }
        toggleLike({ postId });
      }}
      disabled={isPending}
    >
      <Heart
        className={`h-4 w-4 ${
          likeStatus?.liked ? "fill-current text-red-500" : ""
        }`}
      />
      <span>{initialLikes}</span>
    </Button>
  );
}
