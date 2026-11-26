import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

export const appRouter = createTRPCRouter({
  health: publicProcedure
    .output(
      z.object({
        status: z.literal("ok"),
        checkedAt: z.date(),
      }),
    )
    .query(() => ({
      status: "ok" as const,
      checkedAt: new Date(),
    })),
});

export type AppRouter = typeof appRouter;
