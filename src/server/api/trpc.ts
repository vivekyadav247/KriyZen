import "server-only";

import { initTRPC } from "@trpc/server";
import superjson from "superjson";

export async function createTRPCContext({ headers }: { headers: Headers }) {
  return {
    headers,
    requestId: crypto.randomUUID(),
  };
}

export type TRPCContext = Awaited<ReturnType<typeof createTRPCContext>>;

const t = initTRPC.context<TRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error, ctx }) {
    const isInternalError = error.code === "INTERNAL_SERVER_ERROR";

    return {
      ...shape,
      message: isInternalError ? "An unexpected error occurred." : shape.message,
      data: {
        ...shape.data,
        stack: undefined,
        requestId: ctx?.requestId ?? null,
      },
    };
  },
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;
