import { DataSource } from "apollo-datasource";
import { Service } from "typedi";
import { v4 as uuid } from "uuid";
import {
  RoomConfig,
  RoomDb,
  RoomLink,
  RoomLinkConfig,
  RoomLinkDb,
  SlackNotificationConfig,
  SlackNotificationDb,
} from "../../types/Room";
import { Room } from "../../graphql/types/Room";

@Service()
export class RoomStore extends DataSource {
  private rooms: RoomDb[] = [];

  constructor() {
    super();
  }

  importRoomConfig(roomConfig: RoomConfig): string {
    const roomDb: RoomDb = {
      id: uuid(),
      name: roomConfig.name,
      description: roomConfig.description,
      joinUrl: roomConfig.joinUrl,
      titleUrl: roomConfig.titleUrl,
      icon: roomConfig.icon,
      roomLinks: roomConfig.roomLinks?.map((roomLinkConfig: RoomLinkConfig) =>
        this.importRoomLinkConfig(roomLinkConfig)
      ),
      slackNotification: roomConfig.slackNotification
        ? this.importSlackNotificationConfig(roomConfig.slackNotification)
        : undefined,
      meetingId: roomConfig.meetingId,
    };
    this.rooms.push(roomDb);
    return roomDb.id;
  }

  private importRoomLinkConfig(roomLinkConfig: RoomLinkConfig): RoomLinkDb {
    return {
      id: uuid(),
      href: roomLinkConfig.href,
      text: roomLinkConfig.text,
      icon: roomLinkConfig.icon,
      linkGroup: roomLinkConfig.linkGroup,
    };
  }

  private importSlackNotificationConfig(slackNotificationConfig: SlackNotificationConfig): SlackNotificationDb {
    return {
      id: uuid(),
      channelId: slackNotificationConfig.channelId,
      notificationInterval: slackNotificationConfig.notificationInterval,
    };
  }

  public getRoom(id: string): Room | undefined {
    const roomDb = this.rooms.find((room: Room) => room.id === id);
    if (roomDb) {
      return new Room(roomDb);
    }
  }

  public getRoomLinks(ids: string[]): RoomLink[] {
    const roomLinks: RoomLink[] = [];
    this.rooms.forEach((room: Room) => {
      room.roomLinks?.forEach((roomLink: RoomLink) => {
        if (ids.includes(roomLink.id)) {
          roomLinks.push(roomLink);
        }
      });
    });
    return roomLinks;
  }

  clear() {
    this.rooms = [];
  }
}
