import { MeetingEventLegacy, MeetingLegacy } from "../../server/types/legacyTypes/MeetingLegacy";

function applyEventTo(meeting: MeetingLegacy, event: MeetingEventLegacy): MeetingLegacy {
  switch (event.type) {
    case "join":
      const newPart = [...meeting.participants, event.participant];
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

function addMeetingIfNotYetPresent(meetings: MeetingLegacy[], meetingId: string): MeetingLegacy[] {
  if (meetings.find((meeting) => meeting.meetingId === meetingId)) {
    return meetings;
  }
  return [...meetings, { meetingId, participants: [] }];
}

export function mapMeetingEventToMeetings(meetings: MeetingLegacy[], event: MeetingEventLegacy): MeetingLegacy[] {
  const modifiedMeetings = addMeetingIfNotYetPresent(meetings, event.meetingId);
  return modifiedMeetings.map((meeting) =>
    meeting.meetingId === event.meetingId ? applyEventTo(meeting, event) : meeting
  );
}
