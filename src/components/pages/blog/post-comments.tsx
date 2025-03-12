"use client";

import { useTransition } from "react";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";
import { useAuth } from "~/hooks/use-auth";
import { toast } from "sonner";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { cn } from "~/lib/utils";

interface PostCommentsProps {
  postId: number;
}

export function PostComments({ postId }: PostCommentsProps) {
  const [isPending, startTransition] = useTransition();
  const [comment, setComment] = useState("");
  const router = useRouter();
  const { user } = useAuth();

  const { data: comments } = api.post.getComments.useQuery(
    { postId },
    { refetchInterval: 30000 }, // Refetch every 30 seconds
  );

  const { mutate: createComment } = api.post.createComment.useMutation({
    onSuccess: () => {
      setComment("");
      startTransition(() => {
        router.refresh();
      });
      toast.success("Comment submitted for approval");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("You must be logged in to comment");
      return;
    }

    if (!comment.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }

    createComment({ postId, content: comment.trim(), parentId: null });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Comments</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Textarea
          placeholder="Write a comment..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          disabled={!user || isPending}
        />
        <Button type="submit" disabled={!user || isPending}>
          Submit Comment
        </Button>
      </form>

      <div className="space-y-4">
        {comments?.map((comment) => (
          <div
            key={comment.id}
            className={cn("flex gap-4", !comment.isApproved && "opacity-50")}
          >
            <Avatar>
              <AvatarImage src={comment.user.avatarUrl ?? undefined} />
              <AvatarFallback>
                {comment.user.name?.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold">{comment.user.name}</span>
                <span className="text-muted-foreground text-sm">
                  {formatDistanceToNow(new Date(comment.createdAt), {
                    addSuffix: true,
                  })}
                </span>
                {!comment.isApproved && (
                  <Badge variant="secondary">Awaiting Approval</Badge>
                )}
              </div>
              <p className="text-muted-foreground mt-1">{comment.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
