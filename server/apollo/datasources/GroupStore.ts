import { DataSource } from "apollo-datasource";
import { Service } from "typedi";
import { v4 as uuid } from "uuid";
import {
  Group,
  GroupConfig,
  GroupDb,
  GroupJoinConfig,
  GroupJoinConfigConfig,
  GroupJoinConfigDb,
} from "../../types/Group";
import { Room, RoomConfig } from "../../types/Room";
import { RoomStore } from "./RoomStore";

@Service()
export class GroupStore extends DataSource {
  private groups: GroupDb[] = [];

  constructor(private roomStore: RoomStore) {
    super();
  }

  importGroupConfig(groupConfig: GroupConfig): string {
    const groupDb: GroupDb = {
      id: uuid(),
      name: groupConfig.name,
      rooms: groupConfig.rooms.map((roomConfig: RoomConfig) => this.roomStore.importRoomConfig(roomConfig)),
      description: groupConfig.description,
      groupJoinConfig: groupConfig.groupJoinConfig
        ? this.importGroupJoinConfigConfig(groupConfig.groupJoinConfig)
        : undefined,
    };
    this.groups.push(groupDb);
    return groupDb.id;
  }

  private importGroupJoinConfigConfig(groupJoinConfigConfig: GroupJoinConfigConfig): GroupJoinConfigDb {
    return {
      id: uuid(),
      minimumParticipantCount: groupJoinConfigConfig.minimumParticipantCount,
      title: groupJoinConfigConfig.title,
      description: groupJoinConfigConfig.description,
      subtitle: groupJoinConfigConfig.subtitle,
    };
  }

  public getGroup(id: string): Group | undefined {
    const groupDb: GroupDb | undefined = this.groups.find((group: GroupDb) => group.id === id);
    if (groupDb) {
      const rooms: Room[] = groupDb.rooms
        .map((roomId: string) => this.roomStore.getRoom(roomId))
        .filter((room: Room | undefined): room is Room => room !== undefined);
      if (rooms.length > 0) {
        return {
          id: groupDb.id,
          name: groupDb.name,
          rooms: rooms,
          description: groupDb.description,
          groupJoinConfig: groupDb.groupJoinConfig,
        };
      }
    }
  }

  public getGroupJoinConfig(id: string): GroupJoinConfig | undefined {
    for (let i = 0; i < this.groups.length; i++) {
      if (this.groups[i].groupJoinConfig?.id === id) {
        return this.groups[i].groupJoinConfig;
      }
    }
    return undefined;
  }

  clear() {
    this.groups = [];
  }
}
