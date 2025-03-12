import { Suspense } from "react";
import BlogDashboardContent from "@/components/pages/blog/blog-dashboard";

export default function BlogPage() {
  return (
    <Suspense>
      <BlogDashboardContent />
    </Suspense>
  );
}
