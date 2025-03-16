import { db } from "~/server/db";
import { trialUsage, users } from "~/server/db/schema";
import { and, eq, sql } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import { TRPCError } from "@trpc/server";

export type TrialStatus = "active" | "completed" | "cancelled";

/**
 * Check if an email has already used a trial for a specific subscription price
 */
export async function hasUsedTrial(email: string, subscriptionPriceId: string) {
  const trials = await db
    .select({ id: trialUsage.id })
    .from(trialUsage)
    .where(
      and(
        eq(trialUsage.email, email),
        eq(trialUsage.subscriptionPriceId, subscriptionPriceId),
      ),
    )
    .limit(1);

  return trials.length > 0;
}

/**
 * Start a trial for a user
 */
export async function startTrial(params: {
  email: string;
  subscriptionPriceId: string;
  userId: string;
  trialEndDate: Date;
}) {
  const { email, subscriptionPriceId, userId, trialEndDate } = params;

  // Check if user has already used this trial
  const hasTrialUsage = await hasUsedTrial(email, subscriptionPriceId);
  if (hasTrialUsage) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "You have already used a trial for this subscription",
    });
  }

  // Start transaction to update both trial_usage and users tables
  return await db.transaction(async (tx) => {
    // Create trial usage record
    await tx.insert(trialUsage).values({
      id: createId(),
      email,
      subscriptionPriceId,
      trialStartedAt: new Date(),
      trialEndedAt: trialEndDate,
      status: "active",
    });

    // Update user's trial status
    await tx
      .update(users)
      .set({
        hasUsedTrial: true,
        isCurrentTrialUser: true,
        trialStartedAt: new Date(),
        trialEndsAt: trialEndDate,
      })
      .where(eq(users.id, userId));
  });
}

/**
 * End a trial (either completed or cancelled)
 */
export async function endTrial(params: {
  email: string;
  subscriptionPriceId: string;
  userId: string;
  status: "completed" | "cancelled";
}) {
  const { email, subscriptionPriceId, userId, status } = params;

  // Start transaction to update both trial_usage and users tables
  return await db.transaction(async (tx) => {
    // Update trial usage record
    await tx
      .update(trialUsage)
      .set({
        status,
        trialEndedAt: new Date(),
      })
      .where(
        and(
          eq(trialUsage.email, email),
          eq(trialUsage.subscriptionPriceId, subscriptionPriceId),
          eq(trialUsage.status, "active"),
        ),
      );

    // Update user's trial status
    await tx
      .update(users)
      .set({
        isCurrentTrialUser: false,
        trialEndsAt: new Date(),
      })
      .where(eq(users.id, userId));
  });
}

/**
 * Get all active trials that have expired
 */
export async function getExpiredTrials() {
  return await db
    .select({
      id: trialUsage.id,
      email: trialUsage.email,
      subscriptionPriceId: trialUsage.subscriptionPriceId,
      trialStartedAt: trialUsage.trialStartedAt,
      trialEndedAt: trialUsage.trialEndedAt,
    })
    .from(trialUsage)
    .where(
      and(
        eq(trialUsage.status, "active"),
        sql`${trialUsage.trialEndedAt} < ${new Date()}`,
      ),
    );
}

/**
 * Mark expired trials as completed and update user statuses
 */
export async function handleExpiredTrials() {
  const expiredTrials = await getExpiredTrials();

  // Get unique user emails to update their statuses
  const uniqueEmails = [...new Set(expiredTrials.map((trial) => trial.email))];

  // Start transaction to update both trial_usage and users tables
  return await db.transaction(async (tx) => {
    // Update all expired trials to completed status
    if (expiredTrials.length > 0) {
      await tx
        .update(trialUsage)
        .set({
          status: "completed",
          trialEndedAt: new Date(),
        })
        .where(
          and(
            eq(trialUsage.status, "active"),
            sql`${trialUsage.trialEndedAt} < ${new Date()}`,
          ),
        );
    }

    // Update all affected users
    if (uniqueEmails.length > 0) {
      await tx
        .update(users)
        .set({
          isCurrentTrialUser: false,
          trialEndsAt: new Date(),
        })
        .where(sql`${users.email} IN ${uniqueEmails}`);
    }
  });
}

/**
 * Get trial status for a specific subscription
 */
export async function getTrialStatus(
  email: string,
  subscriptionPriceId: string,
) {
  const trial = await db
    .select({
      status: trialUsage.status,
      startedAt: trialUsage.trialStartedAt,
      endedAt: trialUsage.trialEndedAt,
    })
    .from(trialUsage)
    .where(
      and(
        eq(trialUsage.email, email),
        eq(trialUsage.subscriptionPriceId, subscriptionPriceId),
      ),
    )
    .orderBy(sql`${trialUsage.createdAt} DESC`)
    .limit(1);

  return trial[0] ?? null;
}
