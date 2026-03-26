"use client";

import { SendIcon } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "./ui/input-group";
import { useState, type SyntheticEvent } from "react";
import { toast } from "sonner";
import { sendMessage, type Message } from "@/services/supabase/actions/messages";
import { UserAuth } from "@/context/AuthContext";

type Props = {
  roomId: string,
  onSend: (message: {id: string, text: string}) => void
  onSuccessfulSend: (message: Message) => void
  onErrorSend: (id: string) => void
}

export function ChatInput({ roomId, onSend, onSuccessfulSend, onErrorSend}: Props) {
  const [message, setMessage] = useState("");
  const { user } = UserAuth();
  const userId = user.id
  async function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e?.preventDefault();
    const text = message.trim();
    if (!message) return;

    setMessage("");
    const id = crypto.randomUUID()
    onSend({id, text})
    const result = await sendMessage({ id, text, roomId, userId});
    if (result.error) {
      toast.error(result.message);
      onErrorSend(id)
    } else {
      onSuccessfulSend(result.message)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-3">
      <InputGroup>
        <InputGroupTextarea
          placeholder="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="field-sizing-content min-h-auto"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
        />
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            type="submit"
            aria-label="Send"
            title="Send"
            size="icon-sm"
          >
            <SendIcon />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </form>
  );
}
