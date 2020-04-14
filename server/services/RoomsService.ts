import { Service } from "typedi";
import { RoomWithParticipants } from "../express/types/RoomWithParticipants";
import { Config } from "../Config";
import { Participant } from "../express/types/Participant";
import { logger } from "../log";
import { KnownUsersService } from "./KnownUsersService";
import {
  RoomEventListener,
  RoomEvent,
  RoomEventType,
  ParticipantEvent,
  ParticipantEventType,
} from "../express/types/RoomEvent";
import { Room } from "../express/types/Room";
import { User } from "../express/types/User";
import { comparableUsername } from "../express/utils/compareableUsername";
import { enrichParticipant } from "../express/utils/enrichUser";

@Service({ multiple: false })
export class RoomsService {
  private roomParticipants: {
    [roomId: string]: Participant[];
  } = {};
  private roomEventListeners: RoomEventListener[] = [];
  private rooms: Room[] = [];

  constructor(private readonly config: Config, private readonly knownUsersService: KnownUsersService) {
    config.rooms.map((room) => this.createRoom(room));
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

    logger.info(`creating room: ${JSON.stringify(room)}`);
    this.rooms = [...this.rooms, room];
    this.roomParticipants[room.id] = [];
    this.notifyRoomChange();

    return true;
  }

  deleteRoom(roomId: string): boolean {
    if (this.config.rooms.some((protectedRoom) => protectedRoom.id === roomId)) {
      logger.info(`cannot delete room, as room with id=${roomId} is protected`);
      return false;
    }

    this.rooms = this.rooms.filter((room) => room.id !== roomId);
    delete this.roomParticipants[roomId];
    this.notifyRoomChange();

    return true;
  }

  joinRoom(roomId: string, toJoin: Participant) {
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
    this.notifyParticipantChange(roomId, toJoin, ParticipantEventType.Join);
  }

  leave(roomId: string, toLeave: Participant) {
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
      this.notifyParticipantChange(roomId, toLeave, ParticipantEventType.Leave);
    }
  }

  leaveRoom(roomId: string, userId: string) {
    if (this.roomParticipants[roomId]) {
      const toLeave = this.roomParticipants[roomId].filter((user) => user.id === userId);
      this.roomParticipants[roomId] = this.roomParticipants[roomId].filter((user) => !toLeave.includes(user));
      toLeave.forEach((user) => this.notifyParticipantChange(roomId, user, ParticipantEventType.Leave));
    }
  }

  endRoom(roomId: string) {
    const room = this.rooms.find((room) => room.id === roomId);
    if (!room) {
      logger.info(`cannot end room, as room with id=${roomId} is unknown`);
      return;
    }

    logger.info(`endRoom - all participants had to leave`);

    this.roomParticipants[roomId].forEach((participant) => {
      this.notifyParticipantChange(roomId, participant, ParticipantEventType.Leave);
    });
    this.roomParticipants[roomId] = [];

    if (room.temporary) {
      this.deleteRoom(roomId);
    }
  }

  private enrich(participant: Participant): Participant {
    const user = this.knownUsersService.find(participant.username);
    if (!user) {
      return participant;
    }

    return enrichParticipant(participant, user);
  }

  onUserUpdate(user: User) {
    const username = comparableUsername(user.name);
    Object.entries(this.roomParticipants).map(([room, participants]) => {
      const found = participants.find((participant) => comparableUsername(participant.username) === username);
      if (found) {
        this.notifyParticipantChange(room, enrichParticipant(found, user), ParticipantEventType.Update);
      }
    });
  }

  replaceRoomsWith(rooms: Room[]) {
    rooms.forEach((room) => (this.roomParticipants[room.id] = this.roomParticipants[room.id] || []));
    this.rooms = rooms;

    this.notifyRoomChange();
  }

  subscribe(listener: RoomEventListener) {
    this.roomEventListeners.push(listener);
  }

  private notifyRoomChange() {
    this.notify({
      type: RoomEventType.Replace,
      payload: this.getAllRooms(),
    });
  }

  private notifyParticipantChange(roomId: string, participant: Participant, type: ParticipantEventType) {
    this.notify({
      type,
      payload: {
        roomId,
        participant: this.enrich(participant),
      },
    });
  }

  private notify(event: ParticipantEvent | RoomEvent) {
    this.roomEventListeners.forEach((listener) => listener(event));
  }
}
