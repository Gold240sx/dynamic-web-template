import { Button } from "~/components/ui/button";
import { useSubscriptionTrial } from "~/hooks/use-subscription-trial";
import { formatDistanceToNow } from "date-fns";
import { AlertCircle, CheckCircle, XCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { cn } from "~/lib/utils";

interface TrialStatusProps {
  subscriptionPriceId: string;
  className?: string;
}

export function TrialStatus({
  subscriptionPriceId,
  className,
}: TrialStatusProps) {
  const { isEligible, currentStatus, isLoading, startTrial, endTrial } =
    useSubscriptionTrial(subscriptionPriceId);

  if (isLoading) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <CardTitle>Trial Status</CardTitle>
          <CardDescription>Loading trial information...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!currentStatus && !isEligible) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-destructive" />
            Not Eligible
          </CardTitle>
          <CardDescription>
            You have already used your trial for this subscription.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!currentStatus && isEligible) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="text-success h-5 w-5" />
            Trial Available
          </CardTitle>
          <CardDescription>
            You can start a trial period for this subscription.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => void startTrial()} disabled={isLoading}>
            Start Trial
          </Button>
        </CardContent>
      </Card>
    );
  }

  const isActive = currentStatus?.status === "active";
  const isCompleted = currentStatus?.status === "completed";
  const isCancelled = currentStatus?.status === "cancelled";

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isActive && (
            <>
              <AlertCircle className="text-warning h-5 w-5" />
              Trial Active
            </>
          )}
          {isCompleted && (
            <>
              <CheckCircle className="text-success h-5 w-5" />
              Trial Completed
            </>
          )}
          {isCancelled && (
            <>
              <XCircle className="h-5 w-5 text-destructive" />
              Trial Cancelled
            </>
          )}
        </CardTitle>
        <CardDescription>
          {isActive && currentStatus?.endedAt && (
            <>
              Trial ends{" "}
              {formatDistanceToNow(new Date(currentStatus.endedAt), {
                addSuffix: true,
              })}
            </>
          )}
          {(isCompleted || isCancelled) && currentStatus?.endedAt && (
            <>
              Trial ended{" "}
              {formatDistanceToNow(new Date(currentStatus.endedAt), {
                addSuffix: true,
              })}
            </>
          )}
        </CardDescription>
      </CardHeader>
      {isActive && (
        <CardContent className="flex gap-2">
          <Button
            onClick={() => void endTrial("completed")}
            disabled={isLoading}
            variant="secondary"
          >
            Complete Trial
          </Button>
          <Button
            onClick={() => void endTrial("cancelled")}
            disabled={isLoading}
            variant="destructive"
          >
            Cancel Trial
          </Button>
        </CardContent>
      )}
    </Card>
  );
}
