import { Meeting } from "../../server/express/types/Meeting";
import { MeetingEvent } from "../../server/express/types/MeetingEvent";

function applyEventTo(meeting: Meeting, event: MeetingEvent): Meeting {
  switch (event.type) {
    case "join":
      const newPart = [...meeting.participants, event.participant];
      console.log(newPart);
      return { ...meeting, participants: newPart };
    case "leave":
      return {
        ...meeting,
        participants: meeting.participants.filter(({ id }) => id !== event.participant.id),
      };
    case "update":
      return {
        ...meeting,
        participants: meeting.participants.filter(({ id }) => id !== event.participant.id).concat([event.participant]),
      };
  }
  return meeting;
}

function addMeetingIfNotYetPresent(meetings: Meeting[], meetingId: string): Meeting[] {
  if (meetings.find((meeting) => meeting.meetingId === meetingId)) {
    return meetings;
  }
  return [...meetings, { meetingId, participants: [] }];
}

export function mapMeetingEventToMeetings(meetings: Meeting[], event: MeetingEvent): Meeting[] {
  const modifiedMeetings = addMeetingIfNotYetPresent(meetings, event.meetingId);
  return modifiedMeetings.map((meeting) =>
    meeting.meetingId === event.meetingId ? applyEventTo(meeting, event) : meeting
  );
}
