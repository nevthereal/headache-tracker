import { protectedProcedure, publicProcedure, router } from "../lib/trpc";
import { entry } from "../db/schema";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";
import { zNewEntry } from "global";
import { TRPCError } from "@trpc/server";

export const appRouter = router({
  healthCheck: publicProcedure.query(() => {
    return "OK";
  }),
  privateData: protectedProcedure.query(({ ctx }) => {
    return {
      message: "This is private",
      user: ctx.session.user,
    };
  }),
  entries: protectedProcedure.query(({ ctx }) => {
    return ctx.db
      .select()
      .from(entry)
      .where(eq(entry.userId, ctx.session.user.id))
      .orderBy(desc(entry.date));
  }),
  newEntry: protectedProcedure
    .input(zNewEntry)
    .mutation(async ({ ctx, input: { rating, notes } }) => {
      const ratelimit = new ctx.Ratelimit({
        limit: 5,
        duration: "30s",
        rootKey: process.env.UNKEY_API_KEY || "",
        namespace: "new-entry",
      });

      const { success } = await ratelimit.limit(ctx.session.user.id);

      if (!success) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "Too many requests",
          cause: "Rate limit exceeded",
        });
      }

      return ctx.db
        .insert(entry)
        .values({
          rating,
          notes,
          date: new Date(),
          userId: ctx.session.user.id,
        })
        .returning();
    }),
  deleteEntry: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input: { id } }) => {
      return ctx.db.delete(entry).where(eq(entry.id, id));
    }),
});
export type AppRouter = typeof appRouter;
