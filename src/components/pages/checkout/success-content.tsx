"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useStore } from "~/context/store-context";
import { redirect } from "next/navigation";
import { getCheckoutSession } from "@/app/actions/checkout/actions";

export default function SuccessContent() {
  const searchParams = useSearchParams();
  const session_id = searchParams.get("session_id");
  const [sessionData, setSessionData] = useState<{
    status: string;
    customerEmail?: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasCleared, setHasCleared] = useState(false);
  const store = useStore();

  useEffect(() => {
    if (!session_id) {
      setError("Please provide a valid session_id");
      return;
    }

    // Only fetch if we haven't loaded the session data yet
    if (!sessionData && !error) {
      const fetchSession = async () => {
        try {
          const data = await getCheckoutSession(session_id);
          if (data.status) {
            setSessionData({
              status: data.status,
              customerEmail: data.customerEmail ?? undefined,
            });
            // Only clear cart once
            if (data.status === "complete" && store && !hasCleared) {
              store.clearCart();
              setHasCleared(true);
            }
          }
        } catch (err) {
          const errorMessage =
            err instanceof Error ? err.message : "An error occurred";
          setError(errorMessage);
        }
      };

      void fetchSession();
    }
  }, [session_id, store, sessionData, error, hasCleared]);

  if (error) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center bg-white text-center dark:bg-zinc-950">
        <div className="mx-auto max-w-2xl px-4">
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-red-600">
            Error
          </h1>
          <p className="mb-8 text-lg text-zinc-600 dark:text-zinc-400">
            {error}
          </p>
          <Link
            href="/shop"
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Return to shop
          </Link>
        </div>
      </div>
    );
  }

  if (!sessionData) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center bg-white text-center dark:bg-zinc-950">
        <div className="mx-auto max-w-2xl px-4">
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Processing...
          </h1>
        </div>
      </div>
    );
  }

  if (sessionData.status === "open") {
    return redirect("/shop");
  }

  if (sessionData.status === "complete") {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center bg-white text-center dark:bg-zinc-950">
        <div className="mx-auto max-w-2xl px-4">
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Thank you for your order!
          </h1>
          <p className="mb-8 text-lg text-zinc-600 dark:text-zinc-400">
            We appreciate your business! A confirmation email will be sent to{" "}
            {sessionData.customerEmail}. If you have any questions, please email{" "}
            <a
              href="mailto:orders@example.com"
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              orders@example.com
            </a>
            .
          </p>
          <Link
            href="/shop"
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return redirect("/shop");
}
