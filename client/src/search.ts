import { MeetingParticipant } from "../../server/express/types/MeetingParticipant";
import { MeetingsIndexed } from "./components/MeetingsIndexed";
import { Block, OfficeWithBlocks, Track } from "../../server/express/types/Office";
import { Session } from "../../server/express/types/Session";
import { Room } from "../../server/express/types/Room";
import { cloneDeep } from "lodash";

export function participantMatches(search: string, participant: MeetingParticipant): boolean {
  const email = participant.email || "";
  return participant.username.toLowerCase().includes(search) || email.toLowerCase().includes(search);
}

export function search(searchText: string, office: OfficeWithBlocks, meetings: MeetingsIndexed): OfficeWithBlocks {
  const query = searchText.toLowerCase().normalize();
  if (query.length === 0) {
    return office;
  }

  const officeSearched = cloneDeep(office);

  // filter on matching elements only by traversing office hierarchy
  officeSearched.blocks = officeSearched.blocks.map((block: Block) => {
    if (block.type === "GROUP_BLOCK") {
      if (!block.name?.toLowerCase().includes(searchText) && !block.group.name.toLowerCase().includes(searchText)) {
        block.group.rooms = block.group.rooms.filter((room) => roomMatches(room, searchText, meetings));
      }
    } else {
      if (!block.name?.toLowerCase().includes(searchText)) {
        if (block.tracks.some((track: Track) => track.name.toLowerCase().includes(searchText))) {
          block.sessions = block.sessions.filter((session: Session) =>
            session.trackName?.toLowerCase().includes(searchText)
          );
        } else {
          block.sessions = block.sessions.filter((session: Session) => {
            return (
              session.type === "GROUP_SESSION" ||
              (session.type === "ROOM_SESSION" && roomMatches(session.room, searchText, meetings))
            );
          });
          block.sessions.map((session: Session) => {
            if (session.type === "GROUP_SESSION" && !session.group.name.toLowerCase().includes(searchText)) {
              session.group.rooms = session.group.rooms.filter((room) => roomMatches(room, searchText, meetings));
            }
          });
        }
      }
    }
    return block;
  });

  // remove unused group sessions
  officeSearched.blocks = officeSearched.blocks.map((block: Block) => {
    if (block.type === "SCHEDULE_BLOCK") {
      block.sessions = block.sessions.filter(
        (session: Session) => !(session.type === "GROUP_SESSION" && session.group.rooms.length < 1)
      );
    }
    return block;
  });

  // remove unused blocks
  officeSearched.blocks = officeSearched.blocks.filter((block: Block) => {
    if (block.type === "GROUP_BLOCK") {
      return block.group.rooms.length > 0;
    } else if (block.type === "SCHEDULE_BLOCK") {
      return block.sessions.length > 0;
    }
  });
  return officeSearched;
}

function roomMatches(room: Room, searchText: string, meetings: MeetingsIndexed): boolean {
  const nameMatches = room.name.toLowerCase().includes(searchText);

  const participants = (room.meetingId && meetings[room.meetingId] && meetings[room.meetingId].participants) || [];
  const someParticipantMatches = participants.some((participant) => participantMatches(searchText, participant));

  return nameMatches || someParticipantMatches;
}
