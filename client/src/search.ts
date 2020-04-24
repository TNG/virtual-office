import { RoomWithParticipants } from "../../server/express/types/RoomWithParticipants";
import { MeetingParticipant } from "../../server/express/types/MeetingParticipant";
import { Office } from "../../server/express/types/Office";

export function participantMatches(search: string, participant: MeetingParticipant): boolean {
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

function searchRooms(searchText: string, rooms: RoomWithParticipants[]): RoomWithParticipants[] {
  const searchString = searchText.toLowerCase().normalize();
  if (searchString.length === 0) {
    return rooms;
  }

  return rooms.filter((room) => roomMatches(searchString, room));
}

export function search(searchText: string, office: Office): Office {
  const rooms = searchRooms(searchText, office.rooms);
  return {
    ...office,
    rooms,
  };
}
