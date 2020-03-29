import { Inject } from "typedi";
import { RoomWithParticipants } from "../express/types/RoomWithParticipants";
import { Config } from "../Config";
import { MeetingParticipant } from "../express/types/MeetingParticipant";
import { logger } from "../log";

@Inject()
export class RoomsService {
  private roomParticipants: {
    [roomId: string]: MeetingParticipant[];
  } = {};

  constructor(private readonly config: Config) {
    config.rooms.map((room) => room.id).forEach((roomId) => (this.roomParticipants[roomId] = []));
  }

  getAllRooms(): RoomWithParticipants[] {
    return this.config.rooms.map((room) => room.id).map((roomId) => this.getRoomWithParticipants(roomId));
  }

  getRoomWithParticipants(roomId: string): RoomWithParticipants | undefined {
    const room = this.config.rooms.find((room) => room.id === roomId);
    if (!room) {
      return undefined;
    }

    return {
      ...room,
      participants: this.roomParticipants[roomId],
    };
  }

  joinRoom(roomId: string, participant: MeetingParticipant) {
    if (!this.roomParticipants[roomId]) {
      logger.info(`cannot join room, as room with id=${roomId} is unknown`);
      return;
    }

    this.roomParticipants[roomId].push(participant);
  }

  leaveRoom(roomId: string, toLeave: MeetingParticipant) {
    if (!this.roomParticipants[roomId]) {
      logger.info(`cannot leave room, as room with id=${roomId} is unknown`);
      return;
    }

    this.roomParticipants[roomId] = this.roomParticipants[roomId].filter((participant) => participant !== toLeave);
  }
}
