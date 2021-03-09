"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
var office_old = require("../../server/sz_office_pe.json");
console.log(office_old);
console.log("----------------------");
var office = convertOffice(office_old);
console.log(JSON.stringify(office, null, 4));
// TODO: filter out empty groups, add groups if given in rooms but missing
function convertOffice(office_old) {
    cleanGroupsWithRoomInfo(office_old);
    if (office_old.schedule) {
    }
    else {
        // map groups into groupBlocks and return within officeWithBlocks
        return {
            version: "2",
            blocks: office_old.groups.map(function (group_old) { return ({
                type: "GROUP",
                group: convertGroup(group_old, office_old.rooms)
            }); })
        };
    }
}
function cleanGroupsWithRoomInfo(office_old) {
    var existingGroupIds = office_old.groups.map(function (group) { return group.id; });
    var existingGroupReferences = office_old.rooms.map(function (room) { return room.groupId; });
    // create dummy group if necessary for rooms without group info: TODO rewrite with some?
    if (existingGroupReferences.filter(function (ref) { return ref === undefined || ref === ""; }).length > 0) {
        addGroup(office_old, "dummy_group", ["", undefined]);
    }
    /*// create missing groups
    const missingGroups = existingGroupReferences.filter((ref) => existingGroupIds.indexOf(ref));
    for (let missingGroupId in missingGroups) {
      addGroup(office_old, missingGroupId, [missingGroupId]);
    }
    // remove unused groups (rooms can be kept since they are not added to new OfficeWithBlocks anyway)
    const unusedGroups = existingGroupIds.filter((groupId) => existingGroupReferences.indexOf(groupId));
    office_old.groups = office_old.groups.filter((group) => unusedGroups.indexOf(group.id) === -1);*/
}
// TODO: Check
function addGroup(office_old, groupId, groupReferences) {
    // add group
    office_old.groups.push({
        id: groupId,
        name: groupId
    });
    // add rooms with respective groupId reference to new group
    office_old.rooms = office_old.rooms.map(function (room) {
        if (groupReferences.indexOf(room.groupId) >= 0) {
            console.log("yep");
            return __assign(__assign({}, room), { groupId: groupId });
        }
        else {
            return room;
        }
    });
}
// TODO: finalize, check what happens if no e.g. description given
function convertGroup(group_old, all_rooms) {
    return {
        name: group_old.name,
        description: group_old.description,
        rooms: office_old.rooms
            .filter(function (room_old) { return room_old.groupId === group_old.id; })
            .map(function (room_old) { return convertRoom(room_old); }),
        groupJoinConfig: group_old.groupJoin
    };
}
// TODO: finalize, check what if something required e.g. meetingId not given
function convertRoom(room_old) {
    return {
        name: room_old.name,
        subtitle: room_old.subtitle,
        description: room_old.description,
        joinUrl: room_old.joinUrl,
        meeting: {
            meetingId: room_old.meetingId,
            participants: []
        },
        titleUrl: room_old.titleUrl,
        roomLinks: room_old.links,
        icon: room_old.icon,
        slackNotification: room_old.slackNotification
    };
}
