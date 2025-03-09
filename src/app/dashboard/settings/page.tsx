import { Suspense } from "react";
import SettingsContent from "./settings-content";

export default function SettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto py-8">
          <div className="mb-8">
            <h1 className="mb-4 text-2xl font-bold">Settings</h1>
            <div className="bg-muted h-10 w-80 animate-pulse rounded-md" />
          </div>
          <div className="rounded-md border">
            <div className="bg-muted h-96 animate-pulse" />
          </div>
        </div>
      }
    >
      <SettingsContent />
    </Suspense>
  );
}
