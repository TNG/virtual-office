import { OfficeLegacy, OfficeWithBlocks, GroupBlock, Group, Room, MeetingParticipant } from "../express/types/Office";
import { Group as Group_old } from "../../server/express/types/Group";
import { Room as Room_old } from "../../server/express/types/Room";
import { RoomLink } from "../../server/express/types/RoomLink";

const office_old: OfficeLegacy = require("../../server/sz_office_pe.json");

const office: OfficeWithBlocks = convertOffice(office_old);
console.log(JSON.stringify(office, null, 4));

// todo: show all sessions/rooms -> thereby create required groups?
// todo: finalize for Schedule, adjust cleanGroups fct. therefore
function convertOffice(office_old: OfficeLegacy): OfficeWithBlocks {
  cleanGroupsWithRoomInfo(office_old);
  if (office_old.schedule) {
    /*return {
      version: "2",
      blocks: [
        {
          type: "SCHEDULE",
          tracks: x,
          sessions: y,
        },
      ],
    };*/
  } else {
    // map groups into groupBlocks and return within officeWithBlocks
    return {
      version: "2",
      blocks: office_old.groups.map((group_old: Group_old) => ({
        type: "GROUP",
        group: convertGroup(group_old, office_old.rooms),
      })),
    };
  }
}

function cleanGroupsWithRoomInfo(office_old: OfficeLegacy): void {
  const existingGroupIds = getUniqueExistingGroupIds(office_old);
  const existingGroupReferences = getUniqueExistingGroupReferences(office_old);

  // add missing groups (dummy group only once)
  const missingGroups = existingGroupReferences.filter((ref) => !existingGroupIds.includes(ref));
  let dummyGroupCreated = false;
  for (let missingGroupId of missingGroups) {
    if (["", undefined].includes(missingGroupId)) {
      if (!dummyGroupCreated) {
        addGroup(office_old, "dummy_group", ["", undefined]);
        dummyGroupCreated = true;
      }
    } else {
      addGroup(office_old, missingGroupId, [missingGroupId]);
    }
  }

  // remove unused groups (rooms can be kept since they are not added to new OfficeWithBlocks anyway)
  const unusedGroups = existingGroupIds.filter((groupId) => !existingGroupReferences.includes(groupId));
  office_old.groups = office_old.groups.filter((group) => !unusedGroups.includes(group.id));
}

function getUniqueExistingGroupIds(office_old: OfficeLegacy) {
  const allExistingGroupIds = office_old.groups.map((group) => group.id);
  return allExistingGroupIds.filter((id, index) => allExistingGroupIds.indexOf(id) === index);
}

function getUniqueExistingGroupReferences(office_old: OfficeLegacy) {
  const allExistingGroupReferences = office_old.rooms.map((room) => room.groupId);
  return allExistingGroupReferences.filter((ref, index) => allExistingGroupReferences.indexOf(ref) === index);
}

function addGroup(office_old: OfficeLegacy, groupId: string, groupReferences: string[]): void {
  // add group
  office_old.groups.push({
    id: groupId,
    name: groupId,
  });

  // add rooms with respective groupId reference to new group
  office_old.rooms = office_old.rooms.map((room: Room_old) => {
    if (groupReferences.indexOf(room.groupId) >= 0) {
      return {
        ...room,
        groupId: groupId,
      };
    } else {
      return room;
    }
  });
}

// TODO: what if required props (name) missing?
function convertGroup(group_old: Group_old, all_rooms: Room_old[]): Group {
  return {
    name: group_old.name || null,
    description: group_old.description,
    rooms: office_old.rooms
      .filter((room_old: Room_old) => room_old.groupId === group_old.id)
      .map((room_old: Room_old) => convertRoom(room_old)),
    groupJoinConfig: group_old.groupJoin,
  };
}

// TODO: what if required props (name, meetingId) missing?
function convertRoom(room_old: Room_old): Room {
  const room: Room = {
    name: room_old.name,
    subtitle: room_old.subtitle,
    description: room_old.description,
    joinUrl: room_old.joinUrl,
    meeting: {
      meetingId: room_old.meetingId || null,
      participants: [],
    },
    titleUrl: room_old.titleUrl,
    roomLinks: room_old.links,
    icon: room_old.icon,
    slackNotification: room_old.slackNotification,
  };
  return room;
}
