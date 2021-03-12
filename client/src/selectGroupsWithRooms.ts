import { MeetingsIndexed } from "./components/MeetingsIndexed";
import { search } from "./search";
import { RoomLegacy } from "../../server/express/types/RoomLegacy";
import { GroupLegacy } from "../../server/express/types/GroupLegacy";
import { OfficeLegacy } from "../../server/express/types/OfficeLegacy";

export interface GroupWithRooms {
  group: GroupLegacy;
  rooms: RoomLegacy[];
}

export function selectGroupsWithRooms(
  meetings: MeetingsIndexed,
  searchText: string,
  office: OfficeLegacy
): GroupWithRooms[] {
  const searchResult = search(searchText, office, meetings);
  const undefinedGroup: GroupLegacy = {
    id: "",
    name: "",
  };

  const groups = [undefinedGroup, ...searchResult.groups];
  return groups
    .map((group) => {
      const rooms = searchResult.rooms.filter((room) => (room.groupId || undefinedGroup.id) === group.id);

      return {
        group,
        rooms,
      };
    })
    .filter((entry) => entry.rooms.length > 0);
}
