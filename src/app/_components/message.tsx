"use client";

import { useState, useEffect } from "react";
import { api } from "~/trpc/react";
import Image from "next/image";
import { formatDate } from '~/utils/date';

export function MessageBoard() {
  const [content, setContent] = useState("");
  const [commentContent, setCommentContent] = useState("");
  const [activeMessageId, setActiveMessageId] = useState<string | null>(null);
  const [authorName, setAuthorName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showNameDialog, setShowNameDialog] = useState(false);
  const [tempAction, setTempAction] = useState<{
    type: 'message' | 'comment';
    messageId?: string;
  } | null>(null);

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

  useEffect(() => {
    const savedName = localStorage.getItem('authorName');
    if (savedName) {
      setAuthorName(savedName);
    }
  }, []);

  const handleNameSubmit = (name: string) => {
    localStorage.setItem('authorName', name);
    setAuthorName(name);
    setShowNameDialog(false);
    
    if (tempAction?.type === 'message') {
      createMessage.mutate({ content, authorName: name });
      setIsDialogOpen(false);
    } else if (tempAction?.type === 'comment' && tempAction.messageId) {
      createComment.mutate({
        messageId: tempAction.messageId,
        content: commentContent,
        authorName: name,
      });
    }
    setTempAction(null);
  };

  return (
    <div className="w-full mx-auto space-y-2">
      {/* 打开对话框的按钮 */}
      <div className="flex justify-center">
      <button
        onClick={() => setIsDialogOpen(true)}
        className="w-[380px]  mb-2 mx-2 rounded-full bg-gray-900 px-4 py-2.5 font-medium text-white text-sm active:bg-gray-800 shadow-md hover:shadow-lg transition-all"
      >
        发布新留言
      </button>
      </div>
     

      {/* 留言对话框 */}
      <dialog
        open={isDialogOpen}
        className="fixed inset-0 w-[400px] max-w-lg rounded-2xl p-0 backdrop:bg-gray-950/50 bg-transparent m-auto"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const savedName = localStorage.getItem('authorName');
            if (!savedName) {
              setTempAction({ type: 'message' });
              setShowNameDialog(true);
              return;
            }
            createMessage.mutate({ content, authorName: savedName });
            setIsDialogOpen(false);
          }}
          className="bg-white rounded-2xl p-6 space-y-4"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900">发布新留言</h3>
            <button
              type="button"
              onClick={() => setIsDialogOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          
          <textarea
            placeholder="写下你的留言..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full rounded-xl px-4 py-3 text-black min-h-[80px] text-sm border border-gray-200 focus:border-gray-400 focus:outline-none"
          />
          <button
            type="submit"
            className="w-full rounded-full bg-gray-900 px-4 py-2.5 font-medium text-white text-sm active:bg-gray-800 shadow-md hover:shadow-lg transition-all"
            disabled={createMessage.isPending}
          >
            {createMessage.isPending ? "发布中..." : "发布留言"}
          </button>
        </form>
      </dialog>

      {/* 添加名字输入对话框 */}
      <dialog
        open={showNameDialog}
        className="fixed inset-0 w-[400px] max-w-lg rounded-2xl p-0 backdrop:bg-gray-950/50 bg-transparent m-auto"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const name = e.currentTarget.username.value;
            if (!name.trim()) {
              alert("请输入您的名字");
              return;
            }
            handleNameSubmit(name.trim());
          }}
          className="bg-white rounded-2xl p-6 space-y-4"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900">请输入您的名字</h3>
            <button
              type="button"
              onClick={() => setShowNameDialog(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          <input
            name="username"
            type="text"
            placeholder="您的名字"
            className="w-full rounded-full px-4 py-2 text-black text-sm border border-gray-200 focus:border-gray-400 focus:outline-none"
          />
          <button
            type="submit"
            className="w-full rounded-full bg-gray-900 px-4 py-2.5 font-medium text-white text-sm active:bg-gray-800 shadow-md hover:shadow-lg transition-all"
          >
            确认
          </button>
        </form>
      </dialog>

      {/* 留言列表 */}
      <div className="space-y-2  ">
        {messages.map((message, index) => (
          <div key={index} className="bg-gray-50  p-4 space-y-1  ">
            <div className="flex items-start gap-3">
            <Image
                    src="/logo.jpeg"
                    alt="QQ Icon"
                    width={24}
                    height={24}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium text-gray-900">{message.author.name}</span>
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
                <div key={comment.id} className="bg-white/80 rounded-lg p-2.5 flex items-start gap-2 ">
                  <Image
                    src="/logo.jpeg"
                    alt="QQ Icon"
                    width={24}
                    height={24}
              />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-gray-900">{comment.author.name}</span>
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
                    const savedName = localStorage.getItem('authorName');
                    if (!savedName) {
                      setTempAction({ type: 'comment', messageId: message.id });
                      setShowNameDialog(true);
                      return;
                    }
                    createComment.mutate({
                      messageId: message.id,
                      content: commentContent,
                      authorName: savedName,
                    });
                  }}
                  className="flex gap-2"
                >
                  <input
                    type="text"
                    placeholder="写下你的评论..."
                    value={commentContent}
                    onChange={(e) => setCommentContent(e.target.value)}
                    className="flex-1 rounded-full px-4 py-1.5 text-black text-sm border border-gray-200 focus:border-gray-400 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="rounded-full bg-gray-900 px-4 py-1.5 text-sm text-white active:bg-gray-800"
                    disabled={createComment.isPending}
                  >
                    发送
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setActiveMessageId(message.id)}
                  className="text-xs text-gray-600 hover:text-gray-800 active:text-gray-900 ml-2"
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
