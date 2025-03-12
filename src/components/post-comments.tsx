"use client";

import { useAuth } from "~/hooks/use-auth";
import { api } from "~/trpc/react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { useState } from "react";
import { useToast } from "./ui/use-toast";
import { Badge } from "./ui/badge";
import type { CommentResponseType } from "~/server/db/schema";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { BLOG_CONFIG } from "~/config/blog";
import { differenceInMinutes } from "date-fns";

interface Comment {
  id: string;
  content: string;
  userId: string;
  isApproved: boolean;
  createdAt: Date;
  postId: number;
  parentId: string | null;
  user: {
    name: string | null;
    avatarUrl: string | null;
  };
}

interface PostCommentsProps {
  postId: number;
  commentResponseType: CommentResponseType;
}

export function PostComments({
  postId,
  commentResponseType,
}: PostCommentsProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const utils = api.useUtils();

  const { data: comments } = api.post.getComments.useQuery({ postId });
  const { mutate: createComment } = api.post.createComment.useMutation({
    onSuccess: () => {
      setCommentText("");
      setReplyToId(null);
      void utils.post.getComments.invalidate({ postId });
      toast({
        title: "Comment created",
        description:
          user?.role === "admin"
            ? "Your comment has been posted"
            : "Your comment will be reviewed by a moderator",
      });
    },
  });

  const { mutate: editComment } = api.post.editComment.useMutation({
    onSuccess: () => {
      setCommentText("");
      setEditingCommentId(null);
      void utils.post.getComments.invalidate({ postId });
      toast({
        title: "Comment updated",
        description: "Your comment has been updated successfully",
      });
    },
  });

  const canReplyToComments =
    commentResponseType === "all" ||
    (commentResponseType === "admin" && user?.role === "admin");

  // Check if user has pending comments at a specific level
  const hasPendingComment = (parentId: string | null) => {
    return comments?.some(
      (comment) =>
        comment.userId === user?.id &&
        comment.parentId === parentId &&
        !comment.isApproved,
    );
  };

  // Count user's comments at a specific level
  const getUserCommentCount = (parentId: string | null) => {
    return (
      comments?.filter(
        (comment) =>
          comment.userId === user?.id && comment.parentId === parentId,
      ).length ?? 0
    );
  };

  // Check if comment is within edit window
  const isWithinEditWindow = (createdAt: Date) => {
    return (
      differenceInMinutes(new Date(), createdAt) <=
      BLOG_CONFIG.comments.editTimeWindow
    );
  };

  // Organize comments into a tree structure
  const commentTree = comments?.reduce(
    (acc, comment) => {
      if (!comment.parentId) {
        if (!acc.root) acc.root = [];
        acc.root.push(comment);
      } else {
        if (!acc.replies) acc.replies = {};
        if (!acc.replies[comment.parentId]) acc.replies[comment.parentId] = [];
        acc.replies[comment.parentId].push(comment);
      }
      return acc;
    },
    {} as { root?: Comment[]; replies?: Record<string, Comment[]> },
  );

  const renderComment = (comment: Comment, level = 0) => {
    const replies = commentTree?.replies?.[comment.id] ?? [];
    const isOwnComment = user?.id === comment.userId;
    const canShowReplyButton =
      canReplyToComments &&
      !hasPendingComment(comment.id) &&
      getUserCommentCount(comment.id) <
        BLOG_CONFIG.comments.maxCommentsPerLevel;
    const canEdit = isOwnComment && isWithinEditWindow(comment.createdAt);
    const isEditing = editingCommentId === comment.id;

    return (
      <div
        key={comment.id}
        style={{ marginLeft: `${level * 1}rem` }}
        className="mb-4"
      >
        <div
          className={`${!comment.isApproved && "opacity-50"} rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950`}
        >
          <div className="flex items-center gap-4">
            <Avatar>
              <AvatarImage src={comment.user.avatarUrl ?? undefined} />
              <AvatarFallback>
                {comment.user.name?.slice(0, 2).toUpperCase() ?? "??"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium">{comment.user.name}</p>
                <p className="text-sm text-zinc-500">
                  {new Date(comment.createdAt).toLocaleDateString()}
                </p>
                {!comment.isApproved && isOwnComment && (
                  <Badge variant="secondary" className="opacity-70">
                    Awaiting Approval
                  </Badge>
                )}
              </div>
              {isEditing ? (
                <div className="mt-2">
                  <Textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="mb-2"
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        if (!commentText.trim()) return;
                        editComment({
                          commentId: comment.id,
                          content: commentText,
                        });
                      }}
                    >
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setEditingCommentId(null);
                        setCommentText("");
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="mt-2 text-sm">{comment.content}</p>
              )}
            </div>
          </div>
          <div className="mt-2 flex gap-2">
            {canShowReplyButton && comment.isApproved && (
              <Button
                variant="ghost"
                size="sm"
                className="opacity-40 hover:opacity-100"
                onClick={() =>
                  setReplyToId(replyToId === comment.id ? null : comment.id)
                }
              >
                {replyToId === comment.id ? "Cancel Reply" : "Reply"}
              </Button>
            )}
            {canEdit && !isEditing && (
              <Button
                variant="ghost"
                size="sm"
                className="opacity-40 hover:opacity-100"
                onClick={() => {
                  setEditingCommentId(comment.id);
                  setCommentText(comment.content);
                }}
              >
                Edit
              </Button>
            )}
          </div>
          {replyToId === comment.id && (
            <div className="mt-4">
              <Textarea
                placeholder="Write your reply..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="mb-2"
              />
              <Button
                size="sm"
                onClick={() => {
                  if (!commentText.trim()) return;
                  createComment({
                    postId,
                    content: commentText,
                    parentId: comment.id,
                  });
                }}
              >
                Submit Reply
              </Button>
            </div>
          )}
        </div>
        {replies.length > 0 && (
          <div className="mt-2">
            {replies.map((reply: Comment) => renderComment(reply, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const canAddTopLevelComment =
    !hasPendingComment(null) &&
    getUserCommentCount(null) < BLOG_CONFIG.comments.maxCommentsPerLevel;

  return (
    <div className="space-y-4">
      {user && commentResponseType !== "none" ? (
        canAddTopLevelComment ? (
          <>
            <Textarea
              placeholder="Write a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="mb-2"
            />
            <Button
              onClick={() => {
                if (!commentText.trim()) return;
                createComment({
                  postId,
                  content: commentText,
                  parentId: null,
                });
              }}
            >
              Submit Comment
            </Button>
          </>
        ) : (
          <p className="text-sm text-zinc-500">
            {hasPendingComment(null)
              ? "You have a pending comment awaiting approval."
              : "You've reached the maximum number of comments allowed."}
          </p>
        )
      ) : (
        <p className="text-sm text-zinc-500">
          {!user
            ? "Please sign in to leave a comment."
            : "Comments are disabled for this post."}
        </p>
      )}
      <div className="mt-8">
        {commentTree?.root?.map((comment: Comment) => renderComment(comment))}
      </div>
    </div>
  );
}
