import { useState } from "react";
import { api } from "~/trpc/react";
import { useToast } from "~/components/ui/use-toast";

export function useSubscriptionTrial(subscriptionPriceId: string) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const utils = api.useUtils();

  // Query trial eligibility and status
  const { data: trialData, isLoading: isCheckingEligibility } =
    api.subscription.checkTrialEligibility.useQuery(
      { subscriptionPriceId },
      {
        // Don't refetch on window focus to avoid confusion during trial start/end
        refetchOnWindowFocus: false,
      },
    );

  // Mutations
  const startTrialMutation = api.subscription.startTrial.useMutation({
    onSuccess: () => {
      toast({
        title: "Trial started",
        description: "Your trial period has begun. Enjoy!",
      });
      // Invalidate relevant queries
      void utils.subscription.checkTrialEligibility.invalidate();
    },
    onError: (error) => {
      toast({
        title: "Error starting trial",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const endTrialMutation = api.subscription.endTrial.useMutation({
    onSuccess: () => {
      toast({
        title: "Trial ended",
        description: "Your trial period has been ended.",
      });
      // Invalidate relevant queries
      void utils.subscription.checkTrialEligibility.invalidate();
    },
    onError: (error) => {
      toast({
        title: "Error ending trial",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Action handlers
  const startTrial = async () => {
    setIsLoading(true);
    try {
      await startTrialMutation.mutateAsync({ subscriptionPriceId });
    } finally {
      setIsLoading(false);
    }
  };

  const endTrial = async (status: "completed" | "cancelled") => {
    setIsLoading(true);
    try {
      await endTrialMutation.mutateAsync({ subscriptionPriceId, status });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isEligible: trialData?.isEligible ?? false,
    currentStatus: trialData?.currentStatus,
    isLoading: isLoading || isCheckingEligibility,
    startTrial,
    endTrial,
  };
}
