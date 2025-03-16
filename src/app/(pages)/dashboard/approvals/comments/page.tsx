"use client";

import { Suspense } from "react";
import { api } from "~/trpc/react";
import { Loader2 } from "lucide-react";
import { PendingReviews } from "~/components/pages/admin/pending-reviews";

function CommentsApprovalPageContent() {
  const { isLoading } = api.post.getPendingComments.useQuery();

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container py-8">
      <PendingReviews />
    </div>
  );
}

export default function CommentsApprovalPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[400px] w-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <CommentsApprovalPageContent />
    </Suspense>
  );
}
