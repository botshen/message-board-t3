import Image from "next/image";
import { MessageBoard } from "~/app/_components/message";
import { HydrateClient } from "~/trpc/server";
export const dynamic = 'force-dynamic'

 
export default async function Home() {
  return (
    <HydrateClient>
           <div className="bg-white/90 backdrop-blur-sm max-w-md mx-auto">
            <div className="flex items-center gap-3  my-2">
              <Image
                src="/logo.jpeg"
                alt="QQ Icon"
                width={32}
                height={32}
              />
              <h1 className="text-gray-900 text-2xl font-bold">
                QQ 留言板 ⭐️
              </h1>
            </div>
            <div className="border-t-2 border-gray-200 pt-4">
              <MessageBoard />
            </div>
          </div>
      </HydrateClient>
  );
}
