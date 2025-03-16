import { Badge } from "~/components/ui/badge";
import { useSubscriptionTrial } from "~/hooks/use-subscription-trial";
import { cn } from "~/lib/utils";

interface TrialBadgeProps {
  subscriptionPriceId: string;
  className?: string;
}

export function TrialBadge({
  subscriptionPriceId,
  className,
}: TrialBadgeProps) {
  const { isEligible, currentStatus } =
    useSubscriptionTrial(subscriptionPriceId);

  if (!currentStatus && !isEligible) {
    return null;
  }

  if (!currentStatus && isEligible) {
    return (
      <Badge variant="secondary" className={cn("whitespace-nowrap", className)}>
        Trial Available
      </Badge>
    );
  }

  const isActive = currentStatus?.status === "active";

  if (!isActive) {
    return null;
  }

  return (
    <Badge variant="default" className={cn("whitespace-nowrap", className)}>
      Trial Active
    </Badge>
  );
}
