import * as t from "io-ts";

export const MeetingParticipantLegacyCodec = t.intersection([
  t.type({
    id: t.string,
    username: t.string,
  }),
  t.partial({
    email: t.string,
    imageUrl: t.string,
  }),
]);
export type MeetingParticipantLegacy = t.TypeOf<typeof MeetingParticipantLegacyCodec>;

export const MeetingLegacyCodec = t.type({
  meetingId: t.string,
  participants: t.array(MeetingParticipantLegacyCodec),
});
export type MeetingLegacy = t.TypeOf<typeof MeetingLegacyCodec>;

export type EventTypeLegacy = "join" | "leave" | "update";

export interface MeetingEventLegacy {
  type: EventTypeLegacy;
  participant: MeetingParticipantLegacy;
  meetingId: string;
}

export type EventListenerLegacy = (event: MeetingEventLegacy) => void;
