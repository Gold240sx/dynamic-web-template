"use client";

import { useTransition, useState } from "react";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow, format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Star } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Badge } from "~/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { RouterOutputs } from "~/trpc/shared";

type CommentModalData = {
  id: string;
  content: string;
  userName: string;
  userAvatar?: string | null;
  postTitle: string;
  createdAt: Date;
} | null;

interface ReviewUser {
  id: string;
  name: string | null;
  avatarUrl: string | null;
}

interface ReviewProduct {
  id: string;
  name: string;
}

interface BaseReview {
  id: string;
  content: string;
  rating: number;
  createdAt: string | Date;
  isApproved: boolean;
  user: ReviewUser;
}

interface ProductReview extends BaseReview {
  product: ReviewProduct;
}

export function PendingReviews() {
  const [isPending, startTransition] = useTransition();
  const [selectedComment, setSelectedComment] =
    useState<CommentModalData>(null);
  const router = useRouter();
  const utils = api.useUtils();

  const { data: pendingComments = [] } = api.post.getPendingComments.useQuery();
  const { data: pendingProductReviews } =
    api.productReview.getPending.useQuery();
  const { data: pendingCompanyReviews } =
    api.companyReview.getPending.useQuery();

  const { mutate: updateComment } = api.post.updateComment.useMutation({
    onSuccess: () => {
      toast.success("Comment updated successfully");
      void utils.post.getPendingComments.invalidate();
      void utils.notifications.getUnviewedCounts.invalidate();
    },
  });

  const { mutate: updateProductReview } = api.productReview.update.useMutation({
    onSuccess: () => {
      startTransition(() => {
        router.refresh();
      });
      toast.success("Product review updated");
      void utils.notifications.getUnviewedCounts.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const { mutate: updateCompanyReview } = api.companyReview.update.useMutation({
    onSuccess: () => {
      startTransition(() => {
        router.refresh();
      });
      toast.success("Company review updated");
      void utils.notifications.getUnviewedCounts.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const { mutate: markAsViewed } = api.notifications.markAsViewed.useMutation({
    onSuccess: () => {
      void utils.notifications.getUnviewedCounts.invalidate();
    },
  });

  const handleCommentClick = (comment: (typeof pendingComments)[0]) => {
    setSelectedComment({
      id: comment.id,
      content: comment.content,
      userName: comment.user.name ?? "Unknown User",
      userAvatar: comment.user.avatarUrl,
      postTitle: comment.post.title,
      createdAt: new Date(comment.createdAt),
    });
    markAsViewed({ type: "comments", ids: [comment.id] });
  };

  if (!pendingComments.length) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <p className="text-lg text-gray-500">No pending comments to review</p>
      </div>
    );
  }

  return (
    <>
      <Dialog
        open={!!selectedComment}
        onOpenChange={() => setSelectedComment(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Comment Details</DialogTitle>
          </DialogHeader>
          {selectedComment && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarImage src={selectedComment.userAvatar ?? undefined} />
                  <AvatarFallback>
                    {selectedComment.userName.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold">
                    {selectedComment.userName}
                  </div>
                  <div className="text-muted-foreground text-sm">
                    {format(new Date(selectedComment.createdAt), "PPpp")}
                  </div>
                </div>
              </div>
              <div>
                <div className="text-muted-foreground text-sm font-medium">
                  Post: {selectedComment.postTitle}
                </div>
                <div className="bg-muted mt-2 whitespace-pre-wrap rounded-lg p-4">
                  {selectedComment.content}
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() =>
                    updateComment({
                      id: selectedComment.id,
                      isApproved: true,
                    })
                  }
                >
                  Approve
                </Button>
                <Button
                  variant="destructive"
                  onClick={() =>
                    updateComment({
                      id: selectedComment.id,
                      isApproved: false,
                    })
                  }
                >
                  Reject
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Tabs defaultValue="comments" className="w-full">
        <TabsList>
          <TabsTrigger value="comments">Blog Comments</TabsTrigger>
          <TabsTrigger value="product-reviews">Product Reviews</TabsTrigger>
          <TabsTrigger value="company-reviews">Company Reviews</TabsTrigger>
        </TabsList>

        <TabsContent value="comments" className="space-y-4">
          <h2 className="text-2xl font-semibold">Pending Blog Comments</h2>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Post</TableHead>
                  <TableHead>Comment Preview</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingComments.map((comment) => (
                  <TableRow
                    key={comment.id}
                    className="hover:bg-muted/50 cursor-pointer"
                    onClick={() => handleCommentClick(comment)}
                  >
                    <TableCell>{comment.post.title}</TableCell>
                    <TableCell>
                      {comment.content.length > 100
                        ? `${comment.content.slice(0, 100)}...`
                        : comment.content}
                    </TableCell>
                    <TableCell>{comment.user.name}</TableCell>
                    <TableCell>
                      {formatDistanceToNow(new Date(comment.createdAt), {
                        addSuffix: true,
                      })}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={comment.isApproved ? "success" : "secondary"}
                      >
                        {comment.isApproved ? "Approved" : "Pending"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateComment({
                              id: comment.id,
                              isApproved: true,
                            });
                          }}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateComment({
                              id: comment.id,
                              isApproved: false,
                            });
                          }}
                        >
                          Reject
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="product-reviews" className="space-y-4">
          <h2 className="text-2xl font-semibold">Pending Product Reviews</h2>
          {(pendingProductReviews ?? []).map((review) => (
            <Card key={review.id}>
              <CardHeader>
                <CardTitle className="text-lg">
                  Review for:{" "}
                  {(review as any).product?.name ?? "Deleted Product"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <Avatar>
                    <AvatarImage
                      src={(review as any).user?.avatarUrl ?? undefined}
                    />
                    <AvatarFallback>
                      {(review as any).user?.name?.slice(0, 2).toUpperCase() ??
                        "??"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">
                        {(review as any).user?.name ?? "Unknown User"}
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
                    <p className="text-muted-foreground mt-1">
                      {review.content}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() =>
                      updateProductReview({ id: review.id, isApproved: true })
                    }
                    disabled={isPending}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
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
          ))}
        </TabsContent>

        <TabsContent value="company-reviews" className="space-y-4">
          <h2 className="text-2xl font-semibold">Pending Company Reviews</h2>
          {(pendingCompanyReviews ?? []).map((review) => (
            <Card key={review.id}>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <Avatar>
                    <AvatarImage
                      src={(review as any).user?.avatarUrl ?? undefined}
                    />
                    <AvatarFallback>
                      {(review as any).user?.name?.slice(0, 2).toUpperCase() ??
                        "??"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">
                        {(review as any).user?.name ?? "Unknown User"}
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
                    <p className="text-muted-foreground mt-1">
                      {review.content}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() =>
                      updateCompanyReview({ id: review.id, isApproved: true })
                    }
                    disabled={isPending}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
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
          ))}
        </TabsContent>
      </Tabs>
    </>
  );
}
