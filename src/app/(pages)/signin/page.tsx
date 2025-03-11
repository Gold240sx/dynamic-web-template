"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { Suspense } from "react";
import SignInContent from "../../../components/pages/sign-in/signin-content";

const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type SignInFormData = z.infer<typeof signInSchema>;

interface ErrorResponse {
  error: string;
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto flex h-screen items-center justify-center">
          <div className="w-[400px] animate-pulse space-y-4">
            <div className="h-8 w-1/3 rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-4 w-2/3 rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="space-y-4">
              <div className="h-10 rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-10 rounded bg-zinc-200 dark:bg-zinc-800" />
            </div>
          </div>
        </div>
      }
    >
      <SignInContent />
    </Suspense>
  );
}
