import Image from "next/image";
import { MessageBoard } from "~/app/_components/message";
import { HydrateClient } from "~/trpc/server";
export const dynamic = 'force-dynamic'

 
export default async function Home() {
  return (
    <HydrateClient>
      <main className="min-h-screen bg-gradient-to-b from-[#B8E1FC] to-[#90C6FD]">
        <div className="mx-auto max-w-4xl pt-12 px-4">
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border-2 border-[#7CB9E8] p-8">
            <div className="flex items-center gap-3 mb-6">
              <Image
                src="/logo.jpeg"
                alt="QQ Icon"
                width={32}
                height={32}
              />
              <h1 className="text-[#0066CC] text-2xl font-bold bg-gradient-to-r from-[#0066CC] to-[#66B2FF] bg-clip-text text-transparent">
                QQ 留言板 ⭐️
              </h1>
            </div>
            <div className="border-t-2 border-[#CCE6FF] pt-4">
              <MessageBoard />
            </div>
          </div>
        </div>
      </main>
    </HydrateClient>
  );
}
