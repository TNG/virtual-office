import { OfficeWithBlocks } from "../express/types/Office";
import { OfficeService } from "./OfficeService";
import { SessionLegacy, TrackLegacy } from "../express/types/Schedule";
import { RoomLegacy } from "../express/types/RoomLegacy";
import { OfficeLegacy } from "../express/types/OfficeLegacy";
import { GroupLegacy } from "../express/types/GroupLegacy";
import { Room } from "../express/types/Room";
import { Group } from "../express/types/Group";
import { Session } from "../express/types/Session";
import { Config } from "../Config";

/*import { instance, mock, when } from "ts-mockito";
import * as fs from "fs";

const config = mock(Config);
when(config.clientConfig).thenReturn({ timezone: undefined, sessionStartMinutesOffset: 10 } as any);
when(config.configOptions).thenReturn(require("../_sz_office_pe.json"));
const officeWithBlocks = officeLegacyToOfficeWithBlocks(instance(config));
fs.writeFileSync("_sz_office_pe_new.json", JSON.stringify(officeWithBlocks));
console.log(JSON.stringify(officeWithBlocks, null, 2));*/

export function officeLegacyToOfficeWithBlocks(config: Config): OfficeWithBlocks {
  // clean with OfficeService: create Rooms from RoomConfigs, sort Schedule
  const officeService = new OfficeService(config);
  let officeLegacy = officeService.getOffice();
  // clean additionally: remove unused groups, remove faulty sessions
  officeLegacy = cleanOfficeLegacy(officeLegacy);
  if (!officeLegacy.schedule) {
    return {
      version: "2",
      blocks: officeLegacy.groups.map((groupLegacy: GroupLegacy) => ({
        type: "GROUP_BLOCK",
        name: groupLegacy.name || "",
        group: groupLegacytoGroup(officeLegacy, groupLegacy),
      })),
    };
  } else {
    return {
      version: "2",
      blocks: [
        {
          type: "SCHEDULE_BLOCK",
          name: "",
          tracks: officeLegacy.schedule.tracks.map((track: TrackLegacy) => ({ name: track.name })),
          sessions: officeLegacy.schedule.sessions.map((sessionLegacy: SessionLegacy) =>
            sessionLegacyToSession(officeLegacy, sessionLegacy)
          ),
        },
      ],
    };
  }
}

function cleanOfficeLegacy(officeLegacy: OfficeLegacy): OfficeLegacy {
  officeLegacy = removeUnusedGroups(officeLegacy);
  officeLegacy = addDummyGroup(officeLegacy);
  officeLegacy = removeUnusedSessions(officeLegacy);
  return officeLegacy;
}

function removeUnusedGroups(officeLegacy: OfficeLegacy): OfficeLegacy {
  officeLegacy.groups = officeLegacy.groups.filter((groupLegacy: GroupLegacy) => {
    if (!officeLegacy.schedule) {
      return officeLegacy.rooms.some((roomLegacy: RoomLegacy) => roomLegacy.groupId === groupLegacy.id);
    } else {
      return officeLegacy.schedule.sessions.some(
        (sessionLegacy: SessionLegacy) => sessionLegacy.groupId === groupLegacy.id
      );
    }
  });
  return officeLegacy;
}

function addDummyGroup(officeLegacy: OfficeLegacy): OfficeLegacy {
  officeLegacy.groups.push({
    id: "",
    name: "",
  });
  officeLegacy.rooms.forEach((roomLegacy: RoomLegacy) => {
    if (!roomLegacy.groupId) {
      roomLegacy.groupId = "";
    }
  });
  return officeLegacy;
}

// Session must have valid room or group reference
function removeUnusedSessions(officeLegacy: OfficeLegacy): OfficeLegacy {
  if (officeLegacy.schedule) {
    officeLegacy.schedule.sessions = officeLegacy.schedule.sessions.filter(
      (sessionLegacy: SessionLegacy) =>
        (sessionLegacy.roomId &&
          officeLegacy.rooms.some((roomLegacy: RoomLegacy) => roomLegacy.roomId === sessionLegacy.roomId)) ||
        (sessionLegacy.groupId &&
          officeLegacy.groups.some((groupsLegacy: GroupLegacy) => groupsLegacy.id === sessionLegacy.groupId))
    );
  }
  return officeLegacy;
}

function groupLegacytoGroup(officeLegacy: OfficeLegacy, groupLegacy: GroupLegacy): Group {
  return {
    name: groupLegacy.name || "",
    description: groupLegacy.description,
    rooms: officeLegacy.rooms
      .filter((roomLegacy: RoomLegacy) => roomLegacy.groupId === groupLegacy.id)
      .map((roomLegacy: RoomLegacy) => roomLegacyToRoom(roomLegacy)),
    groupJoinConfig: groupLegacy.groupJoin,
  };
}

function roomLegacyToRoom(roomLegacy: RoomLegacy): Room {
  return {
    name: roomLegacy.name,
    meeting: {
      meetingId: roomLegacy.meetingId || "",
      participants: [],
    },
    subtitle: roomLegacy.subtitle,
    description: roomLegacy.description,
    joinUrl: roomLegacy.joinUrl,
    titleUrl: roomLegacy.titleUrl,
    roomLinks: roomLegacy.links,
    icon: roomLegacy.icon,
    slackNotification: roomLegacy.slackNotification,
  };
}

// if Session has roomId and groupId, roomId has prevalence
function sessionLegacyToSession(officeLegacy: OfficeLegacy, sessionLegacy: SessionLegacy): Session {
  if (sessionLegacy.roomId) {
    return {
      type: "ROOM_SESSION",
      start: sessionLegacy.start,
      end: sessionLegacy.end,
      room: roomLegacyToRoom(
        officeLegacy.rooms.find((roomLegacy: RoomLegacy) => roomLegacy.roomId === sessionLegacy.roomId)!
      ),
      trackName:
        officeLegacy.schedule?.tracks.find((track: TrackLegacy) => track.id === sessionLegacy.trackId)?.name || "",
    };
  } else {
    return {
      type: "GROUP_SESSION",
      start: sessionLegacy.start,
      end: sessionLegacy.end,
      group: groupLegacytoGroup(
        officeLegacy,
        officeLegacy.groups.find((groupLegacy: GroupLegacy) => groupLegacy.id === sessionLegacy.groupId)!
      ),
      trackName:
        officeLegacy.schedule?.tracks.find((track: TrackLegacy) => track.id === sessionLegacy.trackId)?.name || "",
    };
  }
}
