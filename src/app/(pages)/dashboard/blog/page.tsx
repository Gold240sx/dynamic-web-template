import { Suspense } from "react";
import BlogDashboardContent from "@/components/pages/blog/blog-dashboard";

export const dynamic = "force-dynamic";

export default function BlogPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BlogDashboardContent />
    </Suspense>
  );
}
