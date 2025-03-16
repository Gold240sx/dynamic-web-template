# Dynamic Page Template

Use this template for creating dynamic pages in Next.js 13+ with TypeScript.

```typescript
// app/(pages)/[dynamicParam]/page.tsx

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ dynamicParam: string }>;
}

export default async function DynamicPage({ params }: PageProps) {
  const { dynamicParam } = await params;

  // Your page logic here
  // Example:
  // const data = await fetchData(dynamicParam);

  // if (!data) {
  //   notFound();
  // }

  return (
    <div>
      {/* Your JSX here */}
    </div>
  );
}
```

## Key Points

1. Export `dynamic = "force-dynamic"` to ensure the page is dynamically rendered
2. Use a Promise type for `params` to handle Next.js async params
3. Await the params before using them
4. Use descriptive names for the component and parameters
5. Handle not found cases appropriately
