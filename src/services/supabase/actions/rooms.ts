// services/rooms.ts
import { supabase } from "@/services/supabase/client";

export async function createRoom(
  name: string,
  isPublic: boolean,
  ownerId: string,
) {
  const { data: room, error: roomError } = await supabase
    .from("chat_room")
    .insert({
      name: name,
      is_public: isPublic,
      owner_id: ownerId,
    })
    .select()
    .single();

  if (roomError || room == null) {
    console.error(roomError);
    return { error: true, message: "Failed to create room" };
  }

  const { error: membershipError } = await supabase
    .from("chat_room_member")
    .insert({ chat_room_id: room.id, member_id: ownerId });

  if (membershipError) {
    console.error(membershipError);
    return { error: true, message: "Failed to add user to room" };
  }

  return { error: false, message: "Created new room", room };
}

// public rooms
export async function getPublicRooms() {
  const { data, error } = await supabase
    .from("chat_room")
    .select("id, name, chat_room_member (count)")
    .eq("is_public", true)
    .order("name", { ascending: true });

  if (error) throw error;
  return data.map((room) => {
    console.log(
      `PUBLIC COUNT FOR ${room.name}: ${room.chat_room_member[0]?.count}`,
    );
    return {
      id: room.id,
      name: room.name,
      memberCount: room.chat_room_member[0]?.count ?? 0,
    };
  });
}

// joined rooms
export async function getJoinedRooms(userId: string) {
  const { data, error } = await supabase
    .from("chat_room")
    .select(
      `
      id,
      name,
      chat_room_member!inner (member_id),
      member_count:chat_room_member(count)
    `,
    )
    .eq("chat_room_member.member_id", userId)
    .order("name", { ascending: true });

  if (error) throw error;
  return data.map((room) => {
    console.log(
      `PRIVATE COUNT FOR ${room.name}: ${room.chat_room_member[0]?.count}`,
    );
    return {
      id: room.id,
      name: room.name,
      memberCount: room.member_count[0]?.count ?? 0,
    };
  });
}

export async function addUserToRoom({
  roomId,
  userId,
}: {
  roomId: string;
  userId: string;
}) {
  const currentUser = await (await supabase.auth.getUser()).data.user;
  console.log("USER:", currentUser);
  if (currentUser == null) {
    return { error: true, message: "User not authenticated" };
  }

  const { data: roomMembership, error: roomMembershipError } = await supabase
    .from("chat_room_member")
    .select("member_id")
    .eq("chat_room_id", roomId)
    .eq("member_id", currentUser.id)
    .single();

  if (roomMembershipError || !roomMembership) {
    return { error: true, message: "Current user is not a member of the room" };
  }

  const { data: userProfile } = await supabase
    .from("user_profile")
    .select("id")
    .eq("id", userId)
    .single();

  if (userProfile == null) {
    return { error: true, message: "User not found" };
  }

  const { data: existingMembership } = await supabase
    .from("chat_room_member")
    .select("member_id")
    .eq("chat_room_id", roomId)
    .eq("member_id", userProfile.id)
    .single();

  if (existingMembership) {
    return { error: true, message: "User is already a member of the room" };
  }

  const { error: insertError } = await supabase
    .from("chat_room_member")
    .insert({ chat_room_id: roomId, member_id: userProfile.id });

  if (insertError) {
    return { error: true, message: "Failed to add user to room" };
  }

  return { error: false, message: "User added to room successfully" };
}
