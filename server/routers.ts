import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import {
  getAgents,
  getAgentMetrics,
  getPrograms,
  getProgramById,
  getVaults,
  getTransactions,
  getNotifications,
  markNotificationAsRead,
} from "./db";
import { getAgentOrchestrator } from "./agents/orchestrator";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  agents: router({
    list: publicProcedure.query(async () => getAgents()),
    getStatus: publicProcedure.query(async () => getAgentOrchestrator().getStatus()),
  }),

  programs: router({
    list: publicProcedure.query(async () => getPrograms()),
  }),

  vaults: router({
    list: publicProcedure.query(async () => getVaults()),
  }),

  transactions: router({
    list: publicProcedure.query(async () => getTransactions(50)),
  }),

  notifications: router({
    list: publicProcedure.query(async () => getNotifications(50)),
  }),

  dashboard: router({
    summary: publicProcedure.query(async () => {
      const agents = await getAgents();
      const programs = await getPrograms();
      const vaults = await getVaults();
      const paulAgent = agents.find((a) => a.name === "Paul");
      const ralphAgent = agents.find((a) => a.name === "Ralph");
      return {
        portfolio: { totalValue: 275000, totalYield: 3200, dailyChange: 2.4 },
        agents: {
          paul: {
            status: paulAgent?.status || "stopped",
            earned: parseFloat(paulAgent?.totalEarned || "0"),
          },
          ralph: {
            status: ralphAgent?.status || "stopped",
            earned: parseFloat(ralphAgent?.totalEarned || "0"),
          },
        },
        programs: { total: programs.length, active: programs.filter((p) => p.status === "active").length },
        vaults: { total: vaults.length },
      };
    }),
  }),
});

export type AppRouter = typeof appRouter;
