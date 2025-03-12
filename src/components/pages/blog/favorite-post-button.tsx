"use client";

import { Star } from "lucide-react";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";
import { toast } from "sonner";

interface FavoritePostButtonProps {
  postId: number;
  initialFavorited: boolean;
}

export function FavoritePostButton({
  postId,
  initialFavorited,
}: FavoritePostButtonProps) {
  const utils = api.useContext();
  const { mutate: toggleFavorite, isPending } =
    api.post.toggleFavorite.useMutation({
      onSuccess: () => {
        void utils.post.getBySlug.invalidate();
        void utils.post.getAllPosts.invalidate();
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => toggleFavorite({ id: postId })}
      disabled={isPending}
      title={initialFavorited ? "Remove from favorites" : "Add to favorites"}
    >
      <Star
        className={`h-4 w-4 ${
          initialFavorited ? "fill-current text-yellow-500" : ""
        }`}
      />
    </Button>
  );
}
