"use client";

import type { Message } from "@/services/supabase/actions/messages";
import { ChatInput } from "./chat-input";
import { ChatMessage } from "./chat-message";
import { RealtimeChannel } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { supabase } from "@/services/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { InviteUserModal } from "./invite-user-modal";

export function RoomClient({
  room,
  user,
  messages,
}: {
  user: {
    id: string;
    name: string;
    image_url: string | null;
  };
  room: {
    id: string;
    name: string;
  };
  messages: Message[];
}) {
  const { connectedUsers, messages: realtimeMessages } = useRealTimeChat({
    roomId: room.id,
    userId: user.id,
  });

  const [sentMessages, setSentMessages] = useState<
    (Message & { status: "pending" | "error" | "success" })[]
  >([]);

  const visibleMessages = messages.toReversed().concat(
    realtimeMessages,
    sentMessages.filter((m) => !realtimeMessages.find((rm) => rm.id === m.id)),
  );

  return (
    <div className="container mx-auto h-screen-with-header border border-y-0 flex flex-col">
      <div className="flex items-center justify-between gap-2 p-4">
        <div className="border-b">
          <h1 className="text-2xl font-bold">{room.name}</h1>
          <p className="text-muted-foreground text-sm">
            {connectedUsers} {connectedUsers === 1 ? "user" : "users"} online
          </p>
        </div>
        <InviteUserModal roomId={room.id} />
      </div>
      <div
        className="grow overflow-y-auto flex flex-col-reverse"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "var(--border) transparent",
        }}
      >
        <div>
          {visibleMessages.map((message) => (
            <ChatMessage key={message.id} {...message} />
          ))}
        </div>
      </div>
      <ChatInput
        roomId={room.id}
        onSend={(message) => {
          setSentMessages((prev) => [
            ...prev,
            {
              id: message.id,
              text: message.text,
              created_at: new Date().toISOString(),
              author_id: user.id,
              author: {
                name: user.name,
                image_url: user.image_url,
              },
              status: "pending",
            },
          ]);
        }}
        onSuccessfulSend={(message) => {
          setSentMessages((prev) =>
            prev.map((m) =>
              m.id === message.id ? { ...message, status: "success" } : m,
            ),
          );
        }}
        onErrorSend={(id) => {
          setSentMessages((prev) =>
            prev.map((m) => (m.id === id ? { ...m, status: "error" } : m)),
          );
        }}
      />
    </div>
  );
}

function useRealTimeChat({
  roomId,
  userId,
}: {
  roomId: string;
  userId: string;
}) {
  const [connectedUsers, setConnectedUsers] = useState<number>(1);
  const [messages, setMessages] = useState<Message[]>([]);
  const queryClient = useQueryClient();
  useEffect(() => {
    let newChannel: RealtimeChannel;
    let cancel = false;

    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("TOKEN", session?.access_token);
      supabase.realtime.setAuth(session?.access_token ?? null).then(() => {
        console.log("AUTH SET, creating channel...");
        if (cancel) return;
        newChannel = supabase.channel(`room:${roomId}:messages`, {
          config: {
            private: true,
            presence: {
              key: userId,
            },
          },
        });

        newChannel
          .on("presence", { event: "sync" }, () => {
            setConnectedUsers(Object.keys(newChannel.presenceState()).length);
          })
          .on("broadcast", { event: "INSERT" }, (payload) => {
            console.log("BROADCAST PAYLOAD", payload); // add this
            const record = payload.payload;
            // queryClient.setQueryData(
            //   ["messages", roomId],
            //   (prev: Message[]) => [
            //     {
            //       id: record.id,
            //       text: record.text,
            //       created_at: record.created_at,
            //       author_id: record.author_id,
            //       author: {
            //         name: record.author_name,
            //         image_url: record.author_image_url,
            //       },
            //     },
            //     ...prev,
            //   ],
            // );

            setMessages((prevMessages) => [
              ...prevMessages,
              {
                id: record.id,
                text: record.text,
                created_at: record.created_at,
                author_id: record.author_id,
                author: {
                  name: record.author_name,
                  image_url: record.author_image_url,
                },
              },
            ]);
          })
          .subscribe((status) => {
            if (status !== "SUBSCRIBED") return;
            newChannel.track({ userId });
          });
      });
    });

    return () => {
      cancel = true;
      if (!newChannel) return;
      newChannel.untrack();
      newChannel.unsubscribe();
    };
  }, [roomId, userId]);

  return { connectedUsers, messages };
}
