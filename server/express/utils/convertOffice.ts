import { compact } from "lodash";
import { OfficeConfig } from "../../types/Office";
import { OfficeConfigLegacy } from "../../types/legacyTypes/OfficeConfigLegacy";
import { OfficeWithBlocksConfig } from "../../types/OfficeWithBlocks";
import { GroupLegacy } from "../../types/legacyTypes/GroupLegacy";
import { SessionLegacy, TrackLegacy } from "../../types/legacyTypes/ScheduleLegacy";
import { RoomConfigLegacy } from "../../types/legacyTypes/RoomLegacy";
import { GroupConfig } from "../../types/Group";
import { RoomConfig } from "../../types/Room";
import { SessionConfig } from "../../types/Session";

export const getOfficeWithBlocksConfigFromOfficeConfig = (officeConfig: OfficeConfig): OfficeWithBlocksConfig => {
  if ("blocks" in officeConfig) {
    return officeConfig as OfficeWithBlocksConfig;
  } else {
    return officeConfigLegacyToOfficeWithBlocksConfig(officeConfig as OfficeConfigLegacy);
  }
};

function officeConfigLegacyToOfficeWithBlocksConfig(officeConfigLegacy: OfficeConfigLegacy): OfficeWithBlocksConfig {
  officeConfigLegacy = cleanOfficeLegacy(officeConfigLegacy);

  if (!officeConfigLegacy.schedule) {
    return {
      version: "2",
      blocks: officeConfigLegacy.groups.map((groupLegacy: GroupLegacy) => ({
        type: "GROUP_BLOCK",
        name: groupLegacy.name || "",
        group: groupLegacyToGroupConfig(officeConfigLegacy, groupLegacy),
      })),
    };
  } else {
    return {
      version: "2",
      blocks: [
        {
          type: "SCHEDULE_BLOCK",
          name: "",
          tracks: officeConfigLegacy.schedule.tracks.map((track: TrackLegacy) => ({ name: track.name })),
          sessions: officeConfigLegacy.schedule.sessions.map((sessionLegacy: SessionLegacy) =>
            sessionLegacyToSessionConfig(officeConfigLegacy, sessionLegacy)
          ),
        },
      ],
    };
  }
}

function cleanOfficeLegacy(officeConfigLegacy: OfficeConfigLegacy): OfficeConfigLegacy {
  officeConfigLegacy = removeUnusedGroups(officeConfigLegacy);
  officeConfigLegacy = addDummyGroup(officeConfigLegacy);
  officeConfigLegacy = removeUnusedSessions(officeConfigLegacy);
  return officeConfigLegacy;
}

function removeUnusedGroups(officeConfigLegacy: OfficeConfigLegacy): OfficeConfigLegacy {
  officeConfigLegacy.groups = officeConfigLegacy.groups.filter((groupLegacy: GroupLegacy) => {
    if (!officeConfigLegacy.schedule) {
      return officeConfigLegacy.rooms.some(
        (roomConfigLegacy: RoomConfigLegacy) => roomConfigLegacy.groupId === groupLegacy.id
      );
    } else {
      return officeConfigLegacy.schedule.sessions.some(
        (sessionLegacy: SessionLegacy) => sessionLegacy.groupId === groupLegacy.id
      );
    }
  });
  return officeConfigLegacy;
}

function addDummyGroup(officeConfigLegacy: OfficeConfigLegacy): OfficeConfigLegacy {
  officeConfigLegacy.groups.push({
    id: "",
    name: "",
  });
  officeConfigLegacy.rooms.forEach((roomConfigLegacy: RoomConfigLegacy) => {
    if (!roomConfigLegacy.groupId) {
      roomConfigLegacy.groupId = "";
    }
  });
  return officeConfigLegacy;
}

// Session must have valid room or group reference
function removeUnusedSessions(officeConfigLegacy: OfficeConfigLegacy): OfficeConfigLegacy {
  if (officeConfigLegacy.schedule) {
    officeConfigLegacy.schedule.sessions = officeConfigLegacy.schedule.sessions.filter(
      (sessionLegacy: SessionLegacy) =>
        (sessionLegacy.roomId &&
          officeConfigLegacy.rooms.some(
            (roomConfigLegacy: RoomConfigLegacy) => roomConfigLegacy.roomId === sessionLegacy.roomId
          )) ||
        (sessionLegacy.groupId &&
          officeConfigLegacy.groups.some((groupsLegacy: GroupLegacy) => groupsLegacy.id === sessionLegacy.groupId))
    );
  }
  return officeConfigLegacy;
}

function groupLegacyToGroupConfig(officeConfigLegacy: OfficeConfigLegacy, groupLegacy: GroupLegacy): GroupConfig {
  return {
    name: groupLegacy.name || "",
    description: groupLegacy.description,
    rooms: officeConfigLegacy.rooms
      .filter((roomConfigLegacy: RoomConfigLegacy) => roomConfigLegacy.groupId === groupLegacy.id)
      .map((roomConfigLegacy: RoomConfigLegacy) => roomConfigLegacyToRoomConfig(roomConfigLegacy)),
    groupJoinConfig: groupLegacy.groupJoin,
  };
}

function roomConfigLegacyToRoomConfig(roomConfigLegacy: RoomConfigLegacy): RoomConfig {
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
function sessionLegacyToSessionConfig(
  officeConfigLegacy: OfficeConfigLegacy,
  sessionLegacy: SessionLegacy
): SessionConfig {
  if (sessionLegacy.roomId) {
    return {
      type: "ROOM_SESSION",
      start: sessionLegacy.start,
      end: sessionLegacy.end,
      room: roomConfigLegacyToRoomConfig(
        officeConfigLegacy.rooms.find(
          (roomConfigegacy: RoomConfigLegacy) => roomConfigegacy.roomId === sessionLegacy.roomId
        )!
      ),
      trackName:
        officeConfigLegacy.schedule?.tracks.find((track: TrackLegacy) => track.id === sessionLegacy.trackId)?.name ||
        "",
    };
  } else {
    return {
      type: "GROUP_SESSION",
      start: sessionLegacy.start,
      end: sessionLegacy.end,
      group: groupLegacyToGroupConfig(
        officeConfigLegacy,
        officeConfigLegacy.groups.find((groupLegacy: GroupLegacy) => groupLegacy.id === sessionLegacy.groupId)!
      ),
      trackName:
        officeConfigLegacy.schedule?.tracks.find((track: TrackLegacy) => track.id === sessionLegacy.trackId)?.name ||
        "",
    };
  }
}
