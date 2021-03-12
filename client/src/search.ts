import { RoomLegacy } from "../../server/express/types/RoomLegacy";
import { MeetingParticipant } from "../../server/express/types/MeetingParticipant";
import { OfficeLegacy } from "../../server/express/types/OfficeLegacy";
import { GroupLegacy } from "../../server/express/types/GroupLegacy";
import { MeetingsIndexed } from "./components/MeetingsIndexed";

export function participantMatches(search: string, participant: MeetingParticipant): boolean {
  const email = participant.email || "";
  return participant.username.toLowerCase().includes(search) || email.toLowerCase().includes(search);
}

export function search(searchText: string, office: OfficeLegacy, meetings: MeetingsIndexed): OfficeLegacy {
  const query = searchText.toLowerCase().normalize();
  if (query.length === 0) {
    return office;
  }

  const rooms = searchRooms(query, office.rooms, office.groups, meetings);
  const groups = searchGroups(rooms, office.groups);

  return {
    groups,
    rooms,
  };
}

function searchRooms(
  search: string,
  rooms: RoomLegacy[],
  groups: GroupLegacy[],
  meetings: MeetingsIndexed
): RoomLegacy[] {
  function roomMatches(room: RoomLegacy): boolean {
    const nameMatches = room.name.toLowerCase().includes(search);

    const groupId = room.groupId || "";
    const group = groups.find((group) => group.id === groupId);
    const groupMatches =
      group &&
      ((group.name && group.name.toLowerCase().includes(search)) ||
        (group.groupJoin && group.groupJoin.title.toLowerCase().includes(search)));

    const participants = (room.meetingId && meetings[room.meetingId] && meetings[room.meetingId].participants) || [];
    const someParticipantMatches = participants.some((participant) => participantMatches(search, participant));

    return nameMatches || groupMatches || someParticipantMatches;
  }

  return rooms.filter((room) => roomMatches(room));
}

function searchGroups(rooms: RoomLegacy[], groups: GroupLegacy[]): GroupLegacy[] {
  return groups.filter((group) => rooms.some((room) => room.groupId === group.id));
}
