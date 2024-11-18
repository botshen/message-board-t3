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

  create: publicProcedure
    .input(
      z.object({ content: z.string().min(1), authorName: z.string().min(1) }),
    )
    .mutation(async ({ ctx, input }) => {
      let author = await ctx.db.user.findFirst({
        where: { name: input.authorName },
      });

      if (!author) {
        author = await ctx.db.user.create({
          data: { name: input.authorName },
        });
      }

      return ctx.db.message.create({
        data: {
          content: input.content,
          authorId: author.id,
        },
        include: {
          author: true,
        },
      });
    }),

  createComment: publicProcedure
    .input(
      z.object({
        content: z.string().min(1),
        authorName: z.string().min(1),
        messageId: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.comment.create({
        data: {
          content: input.content,
          authorId: input.authorName,
          messageId: input.messageId,
        },
      });
    }),
});
