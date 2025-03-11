"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { User } from "@/server/db/types";

interface AuthResponse {
  user: User | null;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/auth/me");
        if (response.ok) {
          const data = (await response.json()) as AuthResponse;
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    void fetchUser();
  }, [searchParams]);

  return { user, loading };
}
