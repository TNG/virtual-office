import { Meeting } from "../../server/express/types/Meeting";
import { MeetingEvent } from "../../server/express/types/MeetingEvent";

export function mapMeetingEventToMeetings(meetings: Meeting[], event: MeetingEvent): Meeting[] {
  function applyEventTo(meeting: Meeting): Meeting {
    switch (event.type) {
      case "join":
        return { ...meeting, participants: [...meeting.participants, event.participant] };
      case "leave":
        return {
          ...meeting,
          participants: meeting.participants.filter(({ id }) => id !== event.participant.id),
        };
      case "update":
        return {
          ...meeting,
          participants: meeting.participants
            .filter(({ id }) => id !== event.participant.id)
            .concat([event.participant]),
        };
    }
    return meeting;
  }

  return meetings.map((meeting) => (meeting.meetingId === event.meetingId ? applyEventTo(meeting) : meeting));
}
