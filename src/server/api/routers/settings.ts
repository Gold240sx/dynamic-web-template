import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";
import { siteSettings } from "~/server/db/schema";
import { createId } from "@paralleldrive/cuid2";
import { eq } from "drizzle-orm";

export const settingsRouter = createTRPCRouter({
  getShippingSettings: publicProcedure.query(async () => {
    const settings = await db
      .select({
        id: siteSettings.id,
        shipmentGroupingDays: siteSettings.shipmentGroupingDays,
        updatedAt: siteSettings.updatedAt,
      })
      .from(siteSettings)
      .limit(1);

    return (
      settings[0] ?? {
        id: createId(),
        shipmentGroupingDays: 7,
        updatedAt: new Date(),
      }
    );
  }),

  updateShippingSettings: publicProcedure
    .input(
      z.object({
        shipmentGroupingDays: z.number().min(1).max(30),
      }),
    )
    .mutation(async ({ input }) => {
      const existingSettings = await db
        .select({
          id: siteSettings.id,
        })
        .from(siteSettings)
        .limit(1);

      if (existingSettings[0]) {
        await db
          .update(siteSettings)
          .set({
            shipmentGroupingDays: input.shipmentGroupingDays,
            updatedAt: new Date(),
          })
          .where(eq(siteSettings.id, existingSettings[0].id));
      } else {
        await db.insert(siteSettings).values({
          id: createId(),
          shipmentGroupingDays: input.shipmentGroupingDays,
          updatedAt: new Date(),
        });
      }

      return { success: true };
    }),
});
