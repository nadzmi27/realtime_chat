"use client";
import type { ComponentProps } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { ActionButton } from "./ui/action-button";
import { UserAuth } from "@/context/AuthContext";
import { supabase } from "@/services/supabase/client";

export function LeaveRoomButton({
  children,
  roomId,
  ...props
}: Omit<ComponentProps<typeof ActionButton>, "action"> & { roomId: string }) {
  const { user } = UserAuth();
  const queryClient = useQueryClient();

  async function leaveRoom() {
    if (user == null) {
      return { error: true, message: "User not logged in" };
    }

    const { error } = await supabase
      .from("chat_room_member")
      .delete()
      .eq("chat_room_id", roomId)
      .eq("member_id", user.id);

    if (error) {
      return { error: true, message: "Failed to leave room" };
    }

    // Refresh cached room lists
    queryClient.invalidateQueries({ queryKey: ["joinedRooms"] });
    queryClient.invalidateQueries({ queryKey: ["publicRooms"] });

    return { error: false };
  }
  return (
    <ActionButton {...props} action={leaveRoom}>
      {children}
    </ActionButton>
  );
}
