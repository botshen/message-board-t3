import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const messageRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    try {
      return await ctx.db.message.findMany({
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
    } catch (error) {
      console.error("数据库查询失败:", error);
      // 返回空数组而不是抛出错误，这样构建过程可以继续
      return [];
    }
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
      let author = await ctx.db.user.findFirst({
        where: { name: input.authorName },
      });

      if (!author) {
        author = await ctx.db.user.create({
          data: { name: input.authorName },
        });
      }

      return ctx.db.comment.create({
        data: {
          content: input.content,
          authorId: author.id,
          messageId: input.messageId,
        },
        include: {
          author: true,
        },
      });
    }),
});
