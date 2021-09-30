import { Room } from "../../server/express/types/Room";
import { MeetingParticipant } from "../../server/express/types/MeetingParticipant";
import { Office } from "../../server/express/types/Office";
import { Group } from "../../server/express/types/Group";
import { MeetingsIndexed } from "./components/MeetingsIndexed";

export function participantMatches(search: string, participant: MeetingParticipant): boolean {
  const email = participant.email || "";
  return participant.username.toLowerCase().includes(search) || email.toLowerCase().includes(search);
}

export function search(searchText: string, office: Office, meetings: MeetingsIndexed): Office {
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

function searchRooms(search: string, rooms: Room[], groups: Group[], meetings: MeetingsIndexed): Room[] {
  function roomMatches(room: Room): boolean {
    const nameMatches = room.name.toLowerCase().includes(search);

    const groupId = room.groupId || "";
    const group = groups.find((group) => group.id === groupId);
    const groupMatches =
      group &&
      ((group.name && group.name.toLowerCase().includes(search)) ||
        (group.groupJoin && group.groupJoin.title.toLowerCase().includes(search)));

    // const participants = (room.meetingId && meetings[room.meetingId] && meetings[room.meetingId].participants) || [];
    // const someParticipantMatches = participants.some((participant) => participantMatches(search, participant));

    const someSpeakerMatches = room.links && room.links.some((link) => link.text.toLowerCase().includes(search));

    return groupMatches || someSpeakerMatches || nameMatches;
  }

  return rooms.filter((room) => roomMatches(room));
}

function searchGroups(rooms: Room[], groups: Group[]): Group[] {
  return groups.filter((group) => rooms.some((room) => room.groupId === group.id));
}
