import { Suspense } from "react";
import BlogFormContent from "./blog-form";

export default function BlogPage() {
  return (
    <Suspense>
      <BlogFormContent />
    </Suspense>
  );
}
