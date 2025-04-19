import { protectedProcedure, publicProcedure, router } from "../lib/trpc";
import { entry } from "../db/schema";
import { eq } from "drizzle-orm";
import { zNewEntry } from "@/lib/zod";

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
      .where(eq(entry.userId, ctx.session.user.id));
  }),
  newEntry: protectedProcedure
    .input(zNewEntry)
    .mutation(({ ctx, input: { rating, notes } }) => {
      return ctx.db.insert(entry).values({
        rating,
        notes,
        date: new Date(),
        userId: ctx.session.user.id,
      });
    }),
});
export type AppRouter = typeof appRouter;
