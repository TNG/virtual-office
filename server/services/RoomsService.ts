import { Service } from "typedi";
import { RoomWithParticipants } from "../express/types/RoomWithParticipants";
import { Config } from "../Config";
import { MeetingParticipant } from "../express/types/MeetingParticipant";
import { logger } from "../log";
import { KnownUsersService } from "./KnownUsersService";
import { EventListener, EventType, RoomEvent } from "../express/types/RoomEvent";
import { Room } from "../express/types/Room";
import { User } from "../express/types/User";
import { comparableUsername } from "../express/utils/compareableUsername";
import { enrichParticipant } from "../express/utils/enrichUser";

@Service({ multiple: false })
export class RoomsService {
  private roomParticipants: {
    [roomId: string]: MeetingParticipant[];
  } = {};
  private roomChangeListeners: EventListener[] = [];
  private rooms: Room[] = [];

  constructor(private readonly config: Config, private readonly knownUsersService: KnownUsersService) {
    config.configOptions.rooms.map((room) => this.createRoom(room));
    this.knownUsersService.listen((user) => this.onUserUpdate(user));
  }

  getAllRooms(): RoomWithParticipants[] {
    return this.rooms.map((room) => room.id).map((roomId) => this.getRoomWithParticipants(roomId));
  }

  getRoomWithParticipants(roomId: string): RoomWithParticipants | undefined {
    const room = this.rooms.find((room) => room.id === roomId);
    if (!room) {
      return undefined;
    }

    return {
      ...room,
      participants: this.roomParticipants[roomId].map((participant) => this.enrich(participant)),
    };
  }

  createRoom(room: Room): boolean {
    if (this.rooms.some((knownRoom) => knownRoom.id === room.id)) {
      logger.info(`cannot create room, as room with id=${room.id} already exists`);
      return false;
    }

    this.rooms = [...this.rooms, room];
    this.roomParticipants[room.id] = [];

    return true;
  }

  deleteRoom(roomId: string): boolean {
    if (this.config.configOptions.rooms.some((protectedRoom) => protectedRoom.id === roomId)) {
      logger.info(`cannot delete room, as room with id=${roomId} is protected`);
      return false;
    }

    this.rooms = this.rooms.filter((room) => roomId !== room.id);
    delete this.roomParticipants[roomId];

    return true;
  }

  joinRoom(roomId: string, toJoin: MeetingParticipant) {
    const participants = this.roomParticipants[roomId];
    if (!participants) {
      logger.info(`cannot join room, as room with id=${roomId} is unknown`);
      return;
    }

    logger.info(`joinRoom - participant with id ${toJoin.id}`);

    if (participants.find((participant) => participant.id === toJoin.id)) {
      logger.info(`joinRoom - participant with id ${toJoin.id} is already in the room, ignoring this call.`);
      return;
    }

    this.leave(roomId, toJoin);

    this.roomParticipants[roomId].push(toJoin);
    this.notify(roomId, toJoin, "join");
  }

  leave(roomId: string, toLeave: MeetingParticipant) {
    logger.info(`leaveRoom - participant with id ${toLeave.id}`);

    const participants = this.roomParticipants[roomId];
    if (!participants) {
      logger.info(`cannot leave room, as room with id=${roomId} is unknown`);
      return;
    }

    const oldParticipants = this.roomParticipants[roomId];
    const newParticipants = oldParticipants.filter((participant) => participant.id !== toLeave.id);
    if (oldParticipants.length !== newParticipants.length) {
      this.roomParticipants[roomId] = newParticipants;
      this.notify(roomId, toLeave, "leave");
    }
  }

  leaveRoom(roomId: string, userId: string) {
    if (this.roomParticipants[roomId]) {
      const toLeave = this.roomParticipants[roomId].filter((user) => user.id === userId);
      this.roomParticipants[roomId] = this.roomParticipants[roomId].filter((user) => !toLeave.includes(user));
      toLeave.forEach((user) => this.notify(roomId, user, "leave"));
    }
  }

  endRoom(roomId: string) {
    if (!this.roomParticipants[roomId]) {
      logger.info(`cannot end room, as room with id=${roomId} is unknown`);
      return;
    }

    logger.info(`endRoom - all participants had to leave`);

    const remainingParticipants = this.roomParticipants[roomId];
    this.roomParticipants[roomId] = [];

    remainingParticipants.forEach((participant) => {
      this.notify(roomId, participant, "leave");
    });
  }

  private enrich(participant: MeetingParticipant): MeetingParticipant {
    if (this.config.anonymousParticipants) {
      return {
        id: participant.id,
        username: "Anonymous",
      };
    }

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

    this.roomChangeListeners.forEach((listener) => listener(event));
  }

  listenRoomChange(listener: (event: RoomEvent) => void) {
    this.roomChangeListeners.push(listener);
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

  replaceRoomsWith(rooms: Room[]) {
    rooms.forEach((room) => (this.roomParticipants[room.id] = this.roomParticipants[room.id] || []));
    this.rooms = rooms;
  }
}
