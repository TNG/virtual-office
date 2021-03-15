import { OfficeWithBlocks } from "../types/Office";
import { OfficeService } from "../../services/OfficeService";
import { Config } from "../../Config";
import { instance, mock, when } from "ts-mockito";
import { SessionLegacy, TrackLegacy } from "../types/Schedule";
import { RoomLegacy } from "../types/RoomLegacy";
import { OfficeLegacy } from "../types/OfficeLegacy";
import { GroupLegacy } from "../types/GroupLegacy";
import { Room } from "../types/Room";
import { Group } from "../types/Group";
import { Session } from "../types/Session";

const config = mock(Config);
when(config.clientConfig).thenReturn({ timezone: undefined, sessionStartMinutesOffset: 10 } as any);
when(config.configOptions).thenReturn(require("../../_sz_office_pe.json"));
const officeWithBlocks = OfficeLegacyToOfficeWithBlocks(instance(config));
console.log(JSON.stringify(officeWithBlocks, null, 4));

export function OfficeLegacyToOfficeWithBlocks(config: Config): OfficeWithBlocks {
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
        group: groupLegacytoGroup(officeLegacy, groupLegacy),
      })),
    };
  } else {
    return {
      version: "2",
      blocks: [
        {
          type: "SCHEDULE_BLOCK",
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
      officeLegacy.rooms.some((roomLegacy: RoomLegacy) => roomLegacy.groupId === groupLegacy.id);
    } /* else {
      officeLegacy.schedule.sessions.some((sessionLegacy: SessionLegacy) => sessionLegacy.groupId === groupLegacy.id);
    }*/
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
    officeLegacy.schedule.sessions.filter((sessionLegacy: SessionLegacy) => {
      if (sessionLegacy.roomId) {
        return officeLegacy.rooms.some((roomLegacy: RoomLegacy) => roomLegacy.roomId === sessionLegacy.roomId);
      } else if (sessionLegacy.groupId) {
        return officeLegacy.groups.some((groupsLegacy: GroupLegacy) => groupsLegacy.id === sessionLegacy.groupId);
      } else {
        return false;
      }
    });
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
      trackId: sessionLegacy.trackId,
    };
  } else
    return {
      type: "GROUP_SESSION",
      start: sessionLegacy.start,
      end: sessionLegacy.end,
      group: groupLegacytoGroup(
        officeLegacy,
        officeLegacy.groups.find((groupLegacy: GroupLegacy) => groupLegacy.id === sessionLegacy.groupId)!
      ),
      trackId: sessionLegacy.trackId,
    };
}