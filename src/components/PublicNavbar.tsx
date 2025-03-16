"use client";
import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "~/hooks/use-auth";
import { ThemeToggle } from "./theme-toggle";

const PublicNavbar = () => {
  const { user } = useAuth();

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-border bg-background/50 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center">
          <Link href="/" className="text-xl font-bold text-foreground">
            T3 MEGA
          </Link>
          <div className="ml-8 flex items-center gap-6">
            <Link
              href="/blog"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Blog
            </Link>
            <Link
              href="/about"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              About
            </Link>
            <Link
              href="/shop"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Store
            </Link>
            <Link
              href={user ? "/dashboard" : "/signin?redirectTo=/dashboard"}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Dashboard
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          {user ? (
            <>
              <Link
                href={`/users/${user.id}`}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                {user.email}
              </Link>
              <form action="/api/auth/signout" method="post">
                <Button type="submit" variant="outline" size="sm">
                  Sign out
                </Button>
              </form>
            </>
          ) : (
            <Link href="/signin">
              <Button variant="outline" size="sm">
                Sign in
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default PublicNavbar;
