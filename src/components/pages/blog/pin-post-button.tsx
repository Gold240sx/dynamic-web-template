"use client";

import { Pin } from "lucide-react";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";
import { toast } from "sonner";

interface PinPostButtonProps {
  postId: number;
  initialPinned: boolean;
}

export function PinPostButton({ postId, initialPinned }: PinPostButtonProps) {
  const utils = api.useContext();
  const { mutate: togglePin, isPending } = api.post.togglePin.useMutation({
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
      onClick={() => togglePin({ id: postId })}
      disabled={isPending}
      title={initialPinned ? "Unpin post" : "Pin post"}
    >
      <Pin
        className={`h-4 w-4 ${
          initialPinned ? "fill-current text-yellow-500" : ""
        }`}
      />
    </Button>
  );
}
