import { RoomWithParticipants } from "../../server/express/types/RoomWithParticipants";
import { MeetingParticipant } from "../../server/express/types/MeetingParticipant";
import { Office } from "../../server/express/types/Office";
import { Group } from "../../server/express/types/Group";

export function participantMatches(search: string, participant: MeetingParticipant): boolean {
  const email = participant.email || "";
  return participant.username.toLowerCase().includes(search) || email.toLowerCase().includes(search);
}

export function search(searchText: string, office: Office): Office {
  const query = searchText.toLowerCase().normalize();
  if (query.length === 0) {
    return office;
  }

  const rooms = searchRooms(query, office.rooms, office.groups);
  const groups = searchGroups(rooms, office.groups);

  return {
    groups,
    rooms,
  };
}

function searchRooms(search: string, rooms: RoomWithParticipants[], groups: Group[]): RoomWithParticipants[] {
  function roomMatches(room: RoomWithParticipants): boolean {
    const nameMatches = room.name.toLowerCase().includes(search);

    const groupId = room.group || "";
    const group = groups.find((group) => group.id === groupId);
    const groupMatches = !!group && group.name.toLowerCase().includes(search);

    const someParticipantMatches = room.participants.some((participant) => participantMatches(search, participant));

    return nameMatches || groupMatches || someParticipantMatches;
  }

  return rooms.filter((room) => roomMatches(room));
}

function searchGroups(rooms: RoomWithParticipants[], groups: Group[]): Group[] {
  return groups.filter((group) => rooms.some((room) => room.group === group.id));
}
