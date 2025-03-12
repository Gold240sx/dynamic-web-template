"use client";

import { api } from "~/trpc/react";
import { Loader2 } from "lucide-react";
import { PendingReviews } from "~/components/pages/admin/pending-reviews";

export default function CommentsApprovalPage() {
  const { isLoading } = api.post.getPendingComments.useQuery();

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] w-full items-center justify-center">
        <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container py-8">
      <PendingReviews />
    </div>
  );
}
