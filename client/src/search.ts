import { RoomWithParticipants } from "./types/RoomWithParticipants";
import { Participant } from "./types/Participant";

export function participantMatches(search: string, participant: Participant): boolean {
  const email = participant.email || "";
  return (
    participant.id === search ||
    participant.username.toLowerCase().includes(search) ||
    email.toLowerCase().includes(search)
  );
}

function roomMatches(search: string, room: RoomWithParticipants): boolean {
  const group = room.group || "";
  return (
    room.name.toLowerCase().includes(search) ||
    group.toLowerCase().includes(search) ||
    room.participants.filter((participant) => participantMatches(search, participant)).length > 0
  );
}

export function search(searchText: string, rooms: RoomWithParticipants[]): RoomWithParticipants[] {
  const searchString = searchText.toLowerCase().normalize();
  if (searchString.length === 0) {
    return rooms;
  }

  return rooms.filter((room) => roomMatches(searchString, room));
}
