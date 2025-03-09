"use client";

import { type ReactNode } from "react";
import { ErrorBoundary as ReactErrorBoundary } from "react-error-boundary";

export function ErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ReactErrorBoundary
      fallback={
        <div className="text-center text-red-500">
          Something went wrong. Please try again.
        </div>
      }
    >
      {children}
    </ReactErrorBoundary>
  );
}
