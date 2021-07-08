import { ZoomUsEvent } from "../express/routes/ZoomUsWebHookRoute";

function participantFor(userId: string, id?: string) {
  return {
    user_id: userId,
    user_name: "shree",
    email: `${userId}@test`,
    id: id,
    join_time: "2019-07-16T17:13:13Z",
  };
}

function eventFor(roomId: string, event: string, participant: any): ZoomUsEvent {
  return ({
    event: event,
    payload: {
      account_id: "abc",
      object: {
        uuid: "uuid",
        id: roomId,
        host_id: "abc",
        topic: "My Meeting",
        type: 2,
        start_time: "2019-07-09T17:00:00Z",
        duration: 60,
        timezone: "America/Los_Angeles",
        participant: participant,
      },
    },
  } as unknown) as ZoomUsEvent;
}

export function joinRoomEvent(roomId: string, userId: string, id?: string): ZoomUsEvent {
  return eventFor(roomId, "meeting.participant_joined", participantFor(userId, id));
}

export function leaveRoomEvent(roomId: string, userId: string, id?: string): ZoomUsEvent {
  return eventFor(roomId, "meeting.participant_left", participantFor(userId, id));
}

export function endMeetingEvent(roomId: string): ZoomUsEvent {
  return eventFor(roomId, "meeting.ended", undefined);
}
