import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const messageRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.message.findMany({
      where: {
        deletedAt: null,
      },
      include: {
        author: true,
        comments: {
          where: {
            deletedAt: null,
          },
          include: {
            author: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }),

  createMessage: publicProcedure
    .input(
      z.object({ content: z.string().min(1), authorName: z.string().min(1) }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.message.create({
        data: {
          content: input.content,
          authorId: input.authorName,
        },
      });
    }),
});
