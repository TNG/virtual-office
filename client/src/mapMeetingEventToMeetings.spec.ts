import { expect } from "chai";
import { mapMeetingEventToMeetings } from "./mapMeetingEventToMeetings";
import { Meeting } from "../../server/express/types/Meeting";
import { MeetingEvent } from "../../server/express/types/MeetingEvent";

const participant1 = { id: "p1", username: "Alice" };
const participant2 = { id: "p2", username: "Bob" };
const participant1Updated = { id: "p1", username: "Alice Updated", email: "alice@new.com" };

describe("mapMeetingEventToMeetings", () => {
  describe("join event", () => {
    it("should add a meeting if not yet present", () => {
      const event: MeetingEvent = { type: "join", meetingId: "m1", participant: participant1 };
      const result = mapMeetingEventToMeetings([], event);

      expect(result).to.deep.equal([{ meetingId: "m1", participants: [participant1] }]);
    });

    it("should add participant to existing meeting on join event", () => {
      const meetings: Meeting[] = [{ meetingId: "m1", participants: [participant2] }];
      const event: MeetingEvent = { type: "join", meetingId: "m1", participant: participant1 };
      const result = mapMeetingEventToMeetings(meetings, event);

      expect(result).to.deep.equal([{ meetingId: "m1", participants: [participant2, participant1] }]);
    });
  });

  describe("leave event", () => {
    it("should remove participant from meeting on leave event", () => {
      const meetings: Meeting[] = [{ meetingId: "m1", participants: [participant1, participant2] }];
      const event: MeetingEvent = { type: "leave", meetingId: "m1", participant: participant1 };
      const result = mapMeetingEventToMeetings(meetings, event);

      expect(result).to.deep.equal([{ meetingId: "m1", participants: [participant2] }]);
    });
  });

  describe("update event", () => {
    it("should update participant in meeting on update event", () => {
      const meetings: Meeting[] = [{ meetingId: "m1", participants: [participant1, participant2] }];
      const event: MeetingEvent = { type: "update", meetingId: "m1", participant: participant1Updated };
      const result = mapMeetingEventToMeetings(meetings, event);

      expect(result).to.deep.equal([{ meetingId: "m1", participants: [participant2, participant1Updated] }]);
    });
  });

  it("should not modify other meetings", () => {
    const otherMeeting: Meeting = { meetingId: "m2", participants: [participant2] };
    const meetings: Meeting[] = [{ meetingId: "m1", participants: [participant1] }, otherMeeting];
    const event: MeetingEvent = { type: "join", meetingId: "m1", participant: participant2 };
    const result = mapMeetingEventToMeetings(meetings, event);

    expect(result[1]).to.deep.equal(otherMeeting);
  });
});
