"use client";

import { Share } from "lucide-react";
import { Button } from "~/components/ui/button";

interface ShareButtonProps {
  title: string;
  text: string;
}

export function ShareButton({ title, text }: ShareButtonProps) {
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url: window.location.href,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      // Fallback to copying to clipboard
      await navigator.clipboard.writeText(window.location.href);
      // You might want to add a toast notification here
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className="flex items-center gap-2"
      onClick={handleShare}
    >
      <Share className="h-4 w-4" />
      Share
    </Button>
  );
}
