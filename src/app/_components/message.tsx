"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import Image from "next/image";
import { formatDate } from '~/utils/date';

export function MessageBoard() {
  const [content, setContent] = useState("");
  const [commentContent, setCommentContent] = useState("");
  const [activeMessageId, setActiveMessageId] = useState<string | null>(null);
  const [authorName, setAuthorName] = useState("");

  const utils = api.useUtils();
  const [messages] = api.message.getAll.useSuspenseQuery();

  const createMessage = api.message.create.useMutation({
    onSuccess: async () => {
      await utils.message.getAll.invalidate();
      setContent("");
      setAuthorName("");
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
    <div className="w-full max-w-md mx-auto px-4 py-6 space-y-6">
      {/* 发布留言表单 */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!authorName.trim()) {
            alert("请输入您的名字");
            return;
          }
          createMessage.mutate({ content, authorName });
        }}
        className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl p-4 space-y-3 border-2 border-purple-200 shadow-lg"
      >
        <input
          type="text"
          placeholder="您的名字"
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          className="w-full rounded-full px-4 py-2 text-black text-sm border-2 border-pink-200 focus:border-purple-300 focus:outline-none"
        />
        <textarea
          placeholder="写下你的留言..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full rounded-xl px-4 py-3 text-black min-h-[80px] text-sm border-2 border-pink-200 focus:border-purple-300 focus:outline-none"
        />
        <button
          type="submit"
          className="w-full rounded-full bg-gradient-to-r from-pink-400 to-purple-500 px-4 py-2.5 font-medium text-white text-sm active:from-pink-500 active:to-purple-600 shadow-md hover:shadow-lg transition-all"
          disabled={createMessage.isPending}
        >
          {createMessage.isPending ? "发布中..." : "发布留言"}
        </button>
      </form>

      {/* 留言列表 */}
      <div className="space-y-4">
        {messages.map((message, index) => (
          <div key={index} className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 space-y-3 border-2 border-blue-100 shadow-md">
            <div className="flex items-start gap-3">
              <Image
                src={"/favicon.ico"}
                alt={message.author.name ?? ""}
                width={36}
                height={36}
                className="rounded-full border-2 border-pink-200"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium text-purple-600">{message.author.name}</span>
                  <span className="text-xs text-gray-500" suppressHydrationWarning>
                    {formatDate(new Date(message.createdAt))}
                  </span>
                </div>
                <p className="mt-1.5 text-sm break-words text-gray-700">{message.content}</p>
              </div>
            </div>

            {/* 评论列表 */}
            <div className="ml-10 space-y-2">
              {message.comments.map((comment) => (
                <div key={comment.id} className="bg-white/80 rounded-lg p-2.5 flex items-start gap-2 border border-purple-100">
                  <Image
                    src={"/favicon.ico"}
                    alt={comment.author.name ?? ""}
                    width={24}
                    height={24}
                    className="rounded-full border border-pink-200"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-purple-600">{comment.author.name}</span>
                      <span className="text-xs text-gray-500" suppressHydrationWarning>
                        {formatDate(new Date(comment.createdAt))}
                      </span>
                    </div>
                    <p className="mt-1 text-sm break-words text-gray-700">{comment.content}</p>
                  </div>
                </div>
              ))}

              {/* 评论表单 */}
              {activeMessageId === message.id ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!authorName.trim()) {
                      alert("请输入您的名字");
                      return;
                    }
                    createComment.mutate({
                      messageId: message.id,
                      content: commentContent,
                      authorName,
                    });
                  }}
                  className="flex gap-2"
                >
                  <input
                    type="text"
                    placeholder="写下你的评论..."
                    value={commentContent}
                    onChange={(e) => setCommentContent(e.target.value)}
                    className="flex-1 rounded-full px-4 py-1.5 text-black text-sm border-2 border-pink-200 focus:border-purple-300 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="rounded-full bg-gradient-to-r from-pink-400 to-purple-500 px-4 py-1.5 text-sm text-white active:from-pink-500 active:to-purple-600"
                    disabled={createComment.isPending}
                  >
                    发送
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setActiveMessageId(message.id)}
                  className="text-xs text-purple-500 hover:text-purple-600 active:text-purple-700 ml-2"
                >
                  回复
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
