"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "./ui/field";
import { Input } from "./ui/input";
import { Checkbox } from "./ui/checkbox";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import { LoadingSwap } from "./ui/loading-swap";
import { createRoom } from "../services/supabase/actions/rooms";
import {
  newRoomSchema,
  NewRoomFormData,
} from "../services/supabase/forms/room";
import { UserAuth } from "../context/AuthContext";
import { toast } from "sonner";

export default function NewRoomPage() {
  const navigate = useNavigate();
  const { user } = UserAuth();

  const form = useForm<NewRoomFormData>({
    defaultValues: {
      name: "",
      isPublic: false,
    },
    resolver: zodResolver(newRoomSchema),
  });

  async function handleSubmit(data: NewRoomFormData) {
    if (!user) {
      throw new Error("User must be authenticated");
    }
    const { error, message, room } = await createRoom(
      data.name,
      data.isPublic,
      user.id,
    );
    if (error) {
      toast.error(message || "Failed to create room");
      return
    }

    navigate(`/rooms/${room.id}`);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="w-full max-w-lg mx-auto">
        <CardHeader>
          <CardTitle>New Room</CardTitle>
          <CardDescription>Create a new chat room</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <FieldGroup>
              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Room Name</FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.error && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="isPublic"
                control={form.control}
                render={({
                  field: { value, onChange, ...field },
                  fieldState,
                }) => (
                  <Field
                    orientation="horizontal"
                    data-invalid={fieldState.invalid}
                  >
                    <Checkbox
                      {...field}
                      id={field.name}
                      checked={value}
                      onCheckedChange={onChange}
                      aria-invalid={fieldState.invalid}
                    />
                    <FieldLabel className="font-normal" htmlFor={field.name}>
                      Public Room
                    </FieldLabel>
                    {fieldState.error && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Field orientation="horizontal" className="w-full">
                <Button
                  type="submit"
                  className="grow"
                  disabled={form.formState.isSubmitting}
                >
                  <LoadingSwap isLoading={form.formState.isSubmitting}>
                    Create Room
                  </LoadingSwap>
                </Button>
                <Button variant="outline" onClick={() => navigate("/")}>
                  Cancel
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
