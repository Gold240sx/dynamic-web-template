import { handleExpiredTrials } from "./trial-utils";

/**
 * Cron job to handle expired trials
 * This should be run every hour to ensure trials are properly ended
 */
export async function handleTrialExpirationCron() {
  try {
    await handleExpiredTrials();
    console.log("[Cron] Successfully processed expired trials");
  } catch (error) {
    console.error("[Cron] Error processing expired trials:", error);
  }
}
