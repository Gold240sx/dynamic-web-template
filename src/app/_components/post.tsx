"use client";

import { Suspense, useState } from "react";
import { api } from "~/trpc/react";
import { ErrorBoundary } from "./error-boundary";

function PostForm() {
  const utils = api.useUtils();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const createPost = api.post.create.useMutation({
    onSuccess: async () => {
      await utils.post.invalidate();
      setTitle("");
      setContent("");
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        createPost.mutate({
          title,
          content: content || "Default content", // Ensure we meet the minimum content requirement
          published: true,
        });
      }}
      className="flex flex-col gap-2"
    >
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full rounded-full px-4 py-2 text-black"
      />
      <textarea
        placeholder="Content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full rounded-xl px-4 py-2 text-black"
        rows={3}
      />
      <button
        type="submit"
        className="rounded-full bg-white/10 px-10 py-3 font-semibold transition hover:bg-white/20"
        disabled={createPost.isPending}
      >
        {createPost.isPending ? "Submitting..." : "Submit"}
      </button>
    </form>
  );
}

function LatestPostContent() {
  const [latestPost] = api.post.getLatest.useSuspenseQuery();

  return (
    <div>
      {latestPost ? (
        <p className="truncate">Your most recent post: {latestPost.title}</p>
      ) : (
        <p>You have no posts yet.</p>
      )}
    </div>
  );
}

export function LatestPost() {
  return (
    <div className="w-full max-w-xs">
      <ErrorBoundary>
        <Suspense fallback={<div>Loading latest post...</div>}>
          <LatestPostContent />
        </Suspense>
      </ErrorBoundary>
      <PostForm />
    </div>
  );
}
