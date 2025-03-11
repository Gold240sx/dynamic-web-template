"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";
import { toast } from "sonner";

interface ShippingStatusDropdownProps {
  orderId: string;
}

export function ShippingStatusDropdown({
  orderId,
}: ShippingStatusDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const utils = api.useUtils();
  const { mutate: updateStatus } = api.order.updateShippingStatus.useMutation({
    onSuccess: () => {
      toast.success("Shipping status updated");
      void utils.order.getById.invalidate({ id: orderId });
    },
  });

  const handleStatusChange = (status: "pending" | "shipped" | "delivered") => {
    updateStatus({ orderId, status });
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleStatusChange("pending")}>
          Mark as Pending
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleStatusChange("shipped")}>
          Mark as Shipped
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleStatusChange("delivered")}>
          Mark as Delivered
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
