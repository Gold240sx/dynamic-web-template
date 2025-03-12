"use client";

import { Suspense } from "react";
import { useDebounce } from "~/hooks/use-debounce";
import { api } from "~/trpc/react";
import { Input } from "~/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { useQueryState } from "nuqs";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "~/components/ui/pagination";

const ITEMS_PER_PAGE = 10;

export default function UsersPage() {
  const [search, setSearch] = useQueryState("search");
  const [page, setPage] = useQueryState("page", {
    parse: (value: string) => Number(value),
    serialize: (value: number) => String(value),
    defaultValue: 1,
  });
  const debouncedSearch = useDebounce(search ?? "", 300);
  const currentPage = Number(page ?? 1);

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="mb-4 text-2xl font-bold">User Management</h1>
        <Input
          type="search"
          placeholder="Search users..."
          value={search ?? ""}
          onChange={(e) => {
            void setSearch(e.target.value);
            void setPage(1); // Reset to first page on search
          }}
          className="max-w-sm"
        />
      </div>

      <div className="rounded-md border">
        <Suspense
          fallback={
            <div className="text-muted-foreground p-8 text-center">
              Loading users...
            </div>
          }
        >
          <UserList search={debouncedSearch} page={currentPage} />
        </Suspense>
      </div>
    </div>
  );
}

function UserList({ search, page }: { search: string; page: number }) {
  const { data } = api.user.getAll.useQuery({
    search,
    page,
    limit: ITEMS_PER_PAGE,
  });

  const users = data?.users ?? [];
  const totalPages = data?.totalPages ?? 1;

  if (!users.length) {
    return (
      <div className="text-muted-foreground p-8 text-center">
        No users found.
      </div>
    );
  }

  return (
    <>
      <div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={user.avatarUrl ?? undefined} />
                      <AvatarFallback>
                        {user.name?.slice(0, 2).toUpperCase() ?? "??"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="font-medium">{user.name}</div>
                  </div>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge
                    variant={user.role === "admin" ? "default" : "secondary"}
                  >
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      user.status === "active" ? "success" : "destructive"
                    }
                  >
                    {user.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {formatDistanceToNow(new Date(user.createdAt), {
                    addSuffix: true,
                  })}
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/dashboard/users/${user.id}`}>
                      View Details
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div id="pagination" className="mt-4 flex justify-center">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href={`?page=${page - 1}${search ? `&search=${search}` : ""}`}
                isDisabled={page <= 1}
              />
            </PaginationItem>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
              (pageNum) => (
                <PaginationItem key={pageNum}>
                  <PaginationLink
                    href={`?page=${pageNum}${search ? `&search=${search}` : ""}`}
                    isActive={page === pageNum}
                  >
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              ),
            )}

            <PaginationItem>
              <PaginationNext
                href={`?page=${page + 1}${search ? `&search=${search}` : ""}`}
                isDisabled={page >= totalPages}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </>
  );
}
