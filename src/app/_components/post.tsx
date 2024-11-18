"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import Image from "next/image";

export function MessageBoard() {
  const [content, setContent] = useState("");
  const [commentContent, setCommentContent] = useState("");
  const [activeMessageId, setActiveMessageId] = useState<string | null>(null);

  const utils = api.useUtils();
  const messages = api.message.getAll.useQuery();
  
  const createMessage = api.message.create.useMutation({
    onSuccess: async () => {
      await utils.message.getAll.invalidate();
      setContent("");
    },
  });

  const createComment = api.message.createComment.useMutation({
    onSuccess: async () => {
      await utils.message.getAll.invalidate();
      setCommentContent("");
      setActiveMessageId(null);
    },
  });

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8">
      {/* 发布留言表单 */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          createMessage.mutate({ content });
        }}
        className="space-y-4"
      >
        <textarea
          placeholder="写下你的留言..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full rounded-lg px-4 py-2 text-black min-h-[100px]"
        />
        <button
          type="submit"
          className="w-full rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
          disabled={createMessage.isPending}
        >
          {createMessage.isPending ? "发布中..." : "发布留言"}
        </button>
      </form>

      {/* 留言列表 */}
      <div className="space-y-6">
        {messages.data?.map((message) => (
          <div key={message.id} className="bg-white/5 rounded-lg p-4 space-y-4">
            <div className="flex items-start gap-3">
              <Image
                src={message.author.image ?? "/default-avatar.png"}
                alt={message.author.name ?? ""}
                width={40}
                height={40}
                className="rounded-full"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{message.author.name}</span>
                  <span className="text-sm text-gray-400">
                    {new Date(message.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="mt-2">{message.content}</p>
              </div>
            </div>

            {/* 评论列表 */}
            <div className="ml-12 space-y-3">
              {message.comments.map((comment) => (
                <div key={comment.id} className="flex items-start gap-3">
                  <Image
                    src={comment.author.image ?? "/default-avatar.png"}
                    alt={comment.author.name ?? ""}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{comment.author.name}</span>
                      <span className="text-sm text-gray-400">
                        {new Date(comment.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="mt-1">{comment.content}</p>
                  </div>
                </div>
              ))}

              {/* 评论表单 */}
              {activeMessageId === message.id ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    createComment.mutate({
                      messageId: message.id,
                      content: commentContent,
                    });
                  }}
                  className="flex gap-2"
                >
                  <input
                    type="text"
                    placeholder="写下你的评论..."
                    value={commentContent}
                    onChange={(e) => setCommentContent(e.target.value)}
                    className="flex-1 rounded-lg px-3 py-1 text-black"
                  />
                  <button
                    type="submit"
                    className="rounded-lg bg-blue-600 px-4 py-1 text-white hover:bg-blue-700"
                    disabled={createComment.isPending}
                  >
                    发送
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setActiveMessageId(message.id)}
                  className="text-sm text-blue-400 hover:text-blue-500"
                >
                  添加评论
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
