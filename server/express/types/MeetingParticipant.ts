import * as t from "io-ts";

export const MeetingParticipantCodec = t.intersection([
  t.type({
    id: t.string,
    username: t.string,
  }),
  t.partial({
    email: t.string,
    imageUrl: t.string,
  }),
]);
export type MeetingParticipant = t.TypeOf<typeof MeetingParticipantCodec>;
