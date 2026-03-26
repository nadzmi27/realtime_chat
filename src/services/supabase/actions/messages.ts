import { UserAuth } from "@/context/AuthContext";
import { supabase } from "../client";

export type Message = {
  id: string;
  text: string;
  created_at: string;
  author_id: string;
  author: {
    name: string;
    image_url: string | null;
  };
};

export async function sendMessage(data: {
  id: string;
  text: string;
  roomId: string;
  userId: string;
}): Promise<
  { error: false; message: Message } | { error: true; message: string }
> {
  if (!data.userId) {
    return { error: true, message: "User not authenticated" };
  }

  if (!data.text.trim()) {
    return { error: true, message: "Message cannot be empty" };
  }

  const { data: membership, error: membershipError } = await supabase
    .from("chat_room_member")
    .select("member_id")
    .eq("chat_room_id", data.roomId)
    .eq("member_id", data.userId)
    .single();

  if (membershipError || !membership) {
    console.log("MEMBERSHIP ERROR", membershipError); // <-- add this
    return { error: true, message: "User is not a member of the chat room" };
  }

  const { data: message, error } = await supabase
    .from("message")
    .insert({
      id: data.id,
      text: data.text.trim(),
      chat_room_id: data.roomId,
      author_id: data.userId,
    })
    .select(
      "id, text, created_at, author_id, author:user_profile (name, image_url)",
    )
    .single();

  if (error) {
    console.log("SEND MESSAGE ERROR", error); // <-- add this
    return { error: true, message: "Failed to send message" };
  }

  return { error: false, message };
}
