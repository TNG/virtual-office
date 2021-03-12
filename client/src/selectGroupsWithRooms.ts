import { MeetingsIndexed } from "./components/MeetingsIndexed";
import { search } from "./search";
import { Room } from "../../server/express/types/Room";
import { Group } from "../../server/express/types/Group";
import { OfficeLegacy } from "../../server/express/types/OfficeLegacy";

export interface GroupWithRooms {
  group: Group;
  rooms: Room[];
}

export function selectGroupsWithRooms(
  meetings: MeetingsIndexed,
  searchText: string,
  office: OfficeLegacy
): GroupWithRooms[] {
  const searchResult = search(searchText, office, meetings);
  const undefinedGroup: Group = {
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
