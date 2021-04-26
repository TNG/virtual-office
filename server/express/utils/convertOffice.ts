import { Office, OfficeWithBlocks } from "../types/Office";
import { SessionLegacy, TrackLegacy } from "../types/Schedule";
import { GroupLegacy } from "../types/GroupLegacy";
import { RoomConfigLegacy } from "../types/RoomLegacy";
import { Room } from "../types/Room";
import { Group } from "../types/Group";
import { Session } from "../types/Session";
import { ConfigOptionsLegacy } from "../types/ConfigOptionsLegacy";
import { compact } from "lodash";

export const getOfficeWithBlocksFromOffice = (
  officeOrConfigOptionsLegacy: Office | ConfigOptionsLegacy
): OfficeWithBlocks => {
  if ("blocks" in officeOrConfigOptionsLegacy) {
    return officeOrConfigOptionsLegacy as OfficeWithBlocks;
  } else {
    return officeLegacyToOfficeWithBlocks(officeOrConfigOptionsLegacy as ConfigOptionsLegacy);
  }
};

function officeLegacyToOfficeWithBlocks(configOptionsLegacy: ConfigOptionsLegacy): OfficeWithBlocks {
  configOptionsLegacy = cleanOfficeLegacy(configOptionsLegacy);

  if (!configOptionsLegacy.schedule) {
    return {
      version: "2",
      blocks: configOptionsLegacy.groups.map((groupLegacy: GroupLegacy) => ({
        type: "GROUP_BLOCK",
        name: groupLegacy.name || "",
        group: groupLegacytoGroup(configOptionsLegacy, groupLegacy),
      })),
    };
  } else {
    return {
      version: "2",
      blocks: [
        {
          type: "SCHEDULE_BLOCK",
          name: "",
          tracks: configOptionsLegacy.schedule.tracks.map((track: TrackLegacy) => ({ name: track.name })),
          sessions: configOptionsLegacy.schedule.sessions.map((sessionLegacy: SessionLegacy) =>
            sessionLegacyToSession(configOptionsLegacy, sessionLegacy)
          ),
        },
      ],
    };
  }
}

function cleanOfficeLegacy(configOptionsLegacy: ConfigOptionsLegacy): ConfigOptionsLegacy {
  configOptionsLegacy = removeUnusedGroups(configOptionsLegacy);
  configOptionsLegacy = addDummyGroup(configOptionsLegacy);
  configOptionsLegacy = removeUnusedSessions(configOptionsLegacy);
  return configOptionsLegacy;
}

function removeUnusedGroups(configOptionsLegacy: ConfigOptionsLegacy): ConfigOptionsLegacy {
  configOptionsLegacy.groups = configOptionsLegacy.groups.filter((groupLegacy: GroupLegacy) => {
    if (!configOptionsLegacy.schedule) {
      return configOptionsLegacy.rooms.some(
        (roomConfigLegacy: RoomConfigLegacy) => roomConfigLegacy.groupId === groupLegacy.id
      );
    } else {
      return configOptionsLegacy.schedule.sessions.some(
        (sessionLegacy: SessionLegacy) => sessionLegacy.groupId === groupLegacy.id
      );
    }
  });
  return configOptionsLegacy;
}

function addDummyGroup(officeLegacy: ConfigOptionsLegacy): ConfigOptionsLegacy {
  officeLegacy.groups.push({
    id: "",
    name: "",
  });
  officeLegacy.rooms.forEach((roomLegacy: RoomConfigLegacy) => {
    if (!roomLegacy.groupId) {
      roomLegacy.groupId = "";
    }
  });
  return officeLegacy;
}

// Session must have valid room or group reference
function removeUnusedSessions(officeLegacy: ConfigOptionsLegacy): ConfigOptionsLegacy {
  if (officeLegacy.schedule) {
    officeLegacy.schedule.sessions = officeLegacy.schedule.sessions.filter(
      (sessionLegacy: SessionLegacy) =>
        (sessionLegacy.roomId &&
          officeLegacy.rooms.some(
            (roomConfigLegacy: RoomConfigLegacy) => roomConfigLegacy.roomId === sessionLegacy.roomId
          )) ||
        (sessionLegacy.groupId &&
          officeLegacy.groups.some((groupsLegacy: GroupLegacy) => groupsLegacy.id === sessionLegacy.groupId))
    );
  }
  return officeLegacy;
}

function groupLegacytoGroup(officeLegacy: ConfigOptionsLegacy, groupLegacy: GroupLegacy): Group {
  return {
    name: groupLegacy.name || "",
    description: groupLegacy.description,
    rooms: officeLegacy.rooms
      .filter((roomConfigLegacy: RoomConfigLegacy) => roomConfigLegacy.groupId === groupLegacy.id)
      .map((roomConfigLegacy: RoomConfigLegacy) => roomConfigLegacyToRoom(roomConfigLegacy)),
    groupJoinConfig: groupLegacy.groupJoin,
  };
}

function roomConfigLegacyToRoom(roomConfigLegacy: RoomConfigLegacy): Room {
  return {
    name: roomConfigLegacy.name,
    meetingId: roomConfigLegacy.meetingId,
    description: compact([roomConfigLegacy.subtitle, roomConfigLegacy.description]).join(" - "),
    joinUrl: roomConfigLegacy.joinUrl,
    titleUrl: roomConfigLegacy.titleUrl,
    roomLinks: roomConfigLegacy.links,
    icon: roomConfigLegacy.icon,
    slackNotification: roomConfigLegacy.slackNotification,
  };
}

// if Session has roomId and groupId, roomId has prevalence
function sessionLegacyToSession(configOptionsLegacy: ConfigOptionsLegacy, sessionLegacy: SessionLegacy): Session {
  if (sessionLegacy.roomId) {
    return {
      type: "ROOM_SESSION",
      start: sessionLegacy.start,
      end: sessionLegacy.end,
      room: roomConfigLegacyToRoom(
        configOptionsLegacy.rooms.find(
          (roomConfigegacy: RoomConfigLegacy) => roomConfigegacy.roomId === sessionLegacy.roomId
        )!
      ),
      trackName:
        configOptionsLegacy.schedule?.tracks.find((track: TrackLegacy) => track.id === sessionLegacy.trackId)?.name ||
        "",
    };
  } else {
    return {
      type: "GROUP_SESSION",
      start: sessionLegacy.start,
      end: sessionLegacy.end,
      group: groupLegacytoGroup(
        configOptionsLegacy,
        configOptionsLegacy.groups.find((groupLegacy: GroupLegacy) => groupLegacy.id === sessionLegacy.groupId)!
      ),
      trackName:
        configOptionsLegacy.schedule?.tracks.find((track: TrackLegacy) => track.id === sessionLegacy.trackId)?.name ||
        "",
    };
  }
}
