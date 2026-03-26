"use client";
import type { ComponentProps } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

import { ActionButton } from "./ui/action-button";
import { UserAuth } from "../context/AuthContext";
import { supabase } from "@/services/supabase/client";

export function JoinRoomButton({
  children,
  roomId,
  ...props
}: Omit<ComponentProps<typeof ActionButton>, "action"> & { roomId: string }) {
  const { user } = UserAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function joinRoom() {
    if (user == null) {
      return { error: true, message: "User not logged in" };
    }

    const { error } = await supabase.from("chat_room_member").insert({
      chat_room_id: roomId,
      member_id: user.id,
    });

    if (error) {
      return { error: true, message: "Failed to join room" };
    }

    // Refresh cached room lists
    queryClient.invalidateQueries({ queryKey: ["joinedRooms"] });
    queryClient.invalidateQueries({ queryKey: ["publicRooms"] });

    // Navigate
    // navigate(`/rooms/${roomId}`);

    return { error: false };
  }
  return (
    <ActionButton {...props} action={joinRoom}>
      {children}
    </ActionButton>
  );
}
