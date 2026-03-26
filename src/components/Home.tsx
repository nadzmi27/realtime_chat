import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { MessagesSquareIcon } from "lucide-react";
import { Button } from "./ui/button";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { UserAuth } from "../context/AuthContext";
import {
  getPublicRooms,
  getJoinedRooms,
} from "../services/supabase/actions/rooms";
import {
  Card,
  CardFooter,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { LeaveRoomButton } from "./leave-room-button";
import { JoinRoomButton } from "./join-room-button";

function Home() {
  const { user } = UserAuth();
  const navigate = useNavigate();

  // fetch public rooms
  const publicRoomsQuery = useQuery({
    queryKey: ["publicRooms"],
    queryFn: getPublicRooms,
  });

  // fetch joined rooms (enabled only if user exists)
  const joinedRoomsQuery = useQuery({
    queryKey: ["joinedRooms", user?.id],
    queryFn: () => getJoinedRooms(user!.id),
    enabled: !!user,
  });

  if (publicRoomsQuery.isLoading || joinedRoomsQuery.isLoading) {
    return <div>Loading...</div>;
  }

  if (publicRoomsQuery.isError || joinedRoomsQuery.isError) {
    console.log(publicRoomsQuery.error);
    console.log(joinedRoomsQuery.error);
    return <div>Error loading rooms</div>;
  }

  const publicRooms = publicRoomsQuery.data ?? [];
  const joinedRooms = joinedRoomsQuery.data ?? [];

  console.log("public:", publicRooms);
  console.log("joined:", joinedRooms);

  if (publicRooms?.length === 0 && joinedRooms?.length === 0) {
    return (
      <div className="text-4xl font-bold mx-auto max-w-3xl px-4 py-8 space-y-8">
        <Empty className="border border-dshed">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <MessagesSquareIcon />
            </EmptyMedia>
            <EmptyTitle>No Chat Rooms</EmptyTitle>
            <EmptyDescription>
              Create a new chat room to gets started.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button onClick={() => navigate("/rooms/new")}>
              <p>Create Room</p>
            </Button>
          </EmptyContent>
        </Empty>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <RoomList title="Your Rooms" rooms={joinedRooms} isJoined />
      <RoomList
        title="Public Rooms"
        rooms={publicRooms?.filter(
          (room) => !joinedRooms?.some((r) => r.id === room.id),
        )}
      />
    </div>
  );
}

function RoomList({
  title,
  rooms,
  isJoined = false,
}: {
  title: string;
  rooms: { id: string; name: string; memberCount: number }[];
  isJoined?: boolean;
}) {
  const navigate = useNavigate();
  if (rooms.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-2xl">{title}</h2>
        <Button onClick={() => navigate("/rooms/new")}>Create Room</Button>
      </div>
      <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(250px,1fr))]">
        {rooms.map((room) => (
          <RoomCard {...room} key={room.id} isJoined={isJoined} />
        ))}
      </div>
    </div>
  );
}

function RoomCard({
  id,
  name,
  memberCount,
  isJoined,
}: {
  id: string;
  name: string;
  memberCount: number;
  isJoined: boolean;
}) {
  const navigate = useNavigate();
  return (
    <Card>
      <CardHeader>
        <CardTitle>{name}</CardTitle>
        <CardDescription>
          {memberCount} {memberCount === 1 ? "member" : "members"}
        </CardDescription>
      </CardHeader>
      <CardFooter className="gap-2">
        {isJoined ? (
          <>
            <Button
              className="grow"
              size="sm"
              onClick={() => navigate(`/rooms/${id}`)}
            >
              Enter
            </Button>
            <LeaveRoomButton roomId={id} size="sm" variant="destructive">
              Leave
            </LeaveRoomButton>
          </>
        ) : (
          <JoinRoomButton
            roomId={id}
            className="grow"
            variant="outline"
            size="sm"
          >
            Join
          </JoinRoomButton>
        )}
      </CardFooter>
    </Card>
  );
}

export default Home;
