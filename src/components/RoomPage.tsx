import { data, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { UserAuth } from "@/context/AuthContext";
import { supabase } from "@/services/supabase/client";
import { RoomClient } from "./RoomClient";
import NotFound from "./NotFound";

export default function RoomPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const { user } = UserAuth();
  
  const { data, isLoading, isError } = useQuery({
    queryKey: ["room", roomId],
    queryFn: () => fetchRoomData(roomId!, user!.id),
    enabled: !!roomId && !!user,
    retry: 0,
  });

  // const { data: messages = []} = useQuery(
  //   {
  //     queryKey: ["messages", roomId],
  //     queryFn: () => getMessages(roomId!),
  //     enabled: !!roomId
  //   }
  // )
  if (isLoading) return <div>Loading...</div>;
  if (isError || !data?.room || !data?.profile) return <NotFound />;

  return (
    <RoomClient room={data.room} user={data.profile} messages={data.messages} />
  );
}

async function fetchRoomData(roomId: string, userId:string) {
  const [room, profile, messages] = await Promise.all([
    getRoom(roomId, userId),
    getProfile(userId),
    getMessages(roomId)
  ]);

  return { room, profile, messages };
}

async function getRoom(id: string, userId: string) {
  console.log("Getting room")
  const { data: room, error } = await supabase
    .from("chat_room")
    .select("id, name, chat_room_member!inner ()")
    .eq("id", id)
    .eq("chat_room_member.member_id", userId)
    .single();

  console.log("Got the room")
  console.log("Data:", room)
  console.log("Error:", error)

  if (error) return null;
  return room;
}

async function getProfile(userId: string) {
  console.log("Getting the profile, id:", userId)
  const { data, error } = await supabase
    .from("user_profile")
    .select("id, name, image_url")
    .eq("id", userId)
    .single();

    
  console.log("Got the profile");
  console.log("Data:", data);
  console.log("Error:", error);

  if (error) return null;
  return data;
}

async function getMessages(roomId: string) {
  console.log("Getting the messages")
  const { data, error } = await supabase
    .from("message")
    .select(
      "id, text, created_at, author_id, author:user_profile  (name, image_url)",
    )
    .eq("chat_room_id", roomId)
    .order("created_at", { ascending: false })
    .limit(100);

        
  console.log("Got the messages");
  console.log("Data:", data);
  console.log("Error:", error);
  if (error) return [];
  return data;
}
