import { Service } from "typedi";
import { MeetingParticipant } from "../express/types/MeetingParticipant";
import { logger } from "../log";
import { KnownUsersService } from "./KnownUsersService";
import { EventListener, EventType, MeetingEvent } from "../express/types/MeetingEvent";
import { User } from "../express/types/User";
import { comparableUsername } from "../express/utils/compareableUsername";
import { enrichParticipant } from "../express/utils/enrichUser";
import { Meeting } from "../express/types/Meeting";

@Service({ multiple: false })
export class MeetingsService {
  private meetingParticipants: {
    [roomId: string]: MeetingParticipant[];
  } = {};
  private roomChangeListeners: EventListener[] = [];

  constructor(private readonly knownUsersService: KnownUsersService) {
    this.knownUsersService.listen((user) => this.onUserUpdate(user));
  }

  getAllMeetings(): Meeting[] {
    return Object.keys(this.meetingParticipants).map((meetingId) => ({
      meetingId,
      participants: this.getParticipantsIn(meetingId),
    }));
  }

  getParticipantsIn(meetingId: string): MeetingParticipant[] {
    const participants = this.meetingParticipants[meetingId] ?? [];
    return participants.map((participant) => this.enrich(participant));
  }

  joinRoom(meetingId: string, toJoin: MeetingParticipant) {
    if (!this.meetingParticipants[meetingId]) {
      this.meetingParticipants[meetingId] = [];
    }

    logger.info(`joinRoom - participant with id ${toJoin.id}`);

    if (this.meetingParticipants[meetingId].find((participant) => participant.id === toJoin.id)) {
      logger.info(`joinRoom - participant with id ${toJoin.id} is already in the room, ignoring this call.`);
      return;
    }

    this.leave(meetingId, toJoin);

    this.meetingParticipants[meetingId].push(toJoin);
    this.notify(meetingId, toJoin, "join");
  }

  leave(meetingId: string, toLeave: MeetingParticipant) {
    logger.info(`leaveRoom - participant with id ${toLeave.id}`);

    const participants = this.meetingParticipants[meetingId];
    if (!participants) {
      logger.info(`cannot leave room, as room with id=${meetingId} is unknown`);
      return;
    }

    const oldParticipants = this.meetingParticipants[meetingId];
    const newParticipants = oldParticipants.filter((participant) => participant.id !== toLeave.id);
    if (oldParticipants.length !== newParticipants.length) {
      this.meetingParticipants[meetingId] = newParticipants;
      this.notify(meetingId, toLeave, "leave");
    }
  }

  leaveRoom(roomId: string, userId: string) {
    if (this.meetingParticipants[roomId]) {
      const toLeave = this.meetingParticipants[roomId].filter((user) => user.id === userId);
      this.meetingParticipants[roomId] = this.meetingParticipants[roomId].filter((user) => !toLeave.includes(user));
      toLeave.forEach((user) => this.notify(roomId, user, "leave"));
    }
  }

  endRoom(roomId: string) {
    if (!this.meetingParticipants[roomId]) {
      logger.info(`cannot end room, as room with id=${roomId} is unknown`);
      return;
    }

    logger.info(`endRoom - all participants had to leave`);

    const remainingParticipants = this.meetingParticipants[roomId];
    this.meetingParticipants[roomId] = [];

    remainingParticipants.forEach((participant) => {
      this.notify(roomId, participant, "leave");
    });
  }

  private enrich(participant: MeetingParticipant): MeetingParticipant {
    const user = this.knownUsersService.find(participant.username);
    if (!user) {
      return participant;
    }

    return enrichParticipant(participant, user);
  }

  private notify(roomId: string, participant: MeetingParticipant, type: EventType) {
    const event: MeetingEvent = {
      participant: this.enrich(participant),
      meetingId: roomId,
      type,
    };

    this.roomChangeListeners.forEach((listener) => listener(event));
  }

  listenParticipantsChange(listener: (event: MeetingEvent) => void) {
    this.roomChangeListeners.push(listener);
  }

  onUserUpdate(user: User) {
    const username = comparableUsername(user.name);
    Object.entries(this.meetingParticipants).map(([room, participants]) => {
      const found = participants.find((participant) => comparableUsername(participant.username) === username);
      if (found) {
        this.notify(room, enrichParticipant(found, user), "update");
      }
    });
  }
}
