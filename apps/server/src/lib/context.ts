import type { Context as HonoContext } from "hono";
import { auth } from "./auth";
import { db } from "../db";
import { Ratelimit } from "@unkey/ratelimit";

export type CreateContextOptions = {
  context: HonoContext;
};

export async function createContext({ context }: CreateContextOptions) {
  const session = await auth.api.getSession({
    headers: context.req.raw.headers,
  });
  return {
    session,
    db,
    Ratelimit,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
