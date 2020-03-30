import { Service } from "typedi";
import { RoomWithParticipants } from "../express/types/RoomWithParticipants";
import { Config } from "../Config";
import { MeetingParticipant } from "../express/types/MeetingParticipant";
import { logger } from "../log";
import { KnownUsersService } from "./KnownUsersService";
import { EventListener, EventType, RoomEvent } from "../express/types/RoomEvent";
import { User } from "../express/types/User";
import { comparableUsername } from "../express/utils/compareableUsername";
import { enrichParticipant } from "../express/utils/enrichUser";

@Service({ multiple: false })
export class RoomsService {
  private roomParticipants: {
    [roomId: string]: MeetingParticipant[];
  } = {};
  private listeners: EventListener[] = [];

  constructor(private readonly config: Config, private readonly knownUsersService: KnownUsersService) {
    config.rooms.map((room) => room.id).forEach((roomId) => (this.roomParticipants[roomId] = []));
    this.knownUsersService.listen((user) => this.onUserUpdate(user));
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
      participants: this.roomParticipants[roomId].map((participant) => this.enrich(participant)),
    };
  }

  joinRoom(roomId: string, toJoin: MeetingParticipant) {
    const participants = this.roomParticipants[roomId];
    if (!participants) {
      logger.info(`cannot join room, as room with id=${roomId} is unknown`);
      return;
    }

    logger.info(`joinRoom - participant with username ${toJoin.username}`);

    console.log(participants);
    console.log(toJoin);

    if (participants.find((participant) => participant.id === toJoin.id)) {
      return;
    }

    participants.push(toJoin);
    this.notify(roomId, toJoin, "join");
  }

  leaveRoom(roomId: string, toLeave: MeetingParticipant) {
    if (!this.roomParticipants[roomId]) {
      logger.info(`cannot leave room, as room with id=${roomId} is unknown`);
      return;
    }

    logger.info(`leaveRoom - participant with username ${toLeave.username}`);

    this.roomParticipants[roomId] = this.roomParticipants[roomId].filter((participant) => participant !== toLeave);

    this.notify(roomId, toLeave, "leave");
  }

  private enrich(participant: MeetingParticipant): MeetingParticipant {
    const user = this.knownUsersService.find(participant.username);
    if (!user) {
      return participant;
    }

    return enrichParticipant(participant, user);
  }

  private notify(roomId: string, participant: MeetingParticipant, type: EventType) {
    const event: RoomEvent = {
      participant: this.enrich(participant),
      roomId,
      type,
    };

    this.listeners.forEach((listener) => listener(event));
  }

  listen(listener: (event: RoomEvent) => void) {
    this.listeners.push(listener);
  }

  onUserUpdate(user: User) {
    const username = comparableUsername(user.name);
    Object.entries(this.roomParticipants).map(([room, participants]) => {
      const found = participants.find((participant) => comparableUsername(participant.username) === username);
      if (found) {
        this.notify(room, enrichParticipant(found, user), "update");
      }
    });
  }
}
