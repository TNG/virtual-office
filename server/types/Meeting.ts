import * as t from "io-ts";

const ParticipantCodec = t.intersection([
  t.type({
    id: t.string,
    username: t.string,
  }),
  t.partial({
    email: t.string,
    imageUrl: t.string,
  }),
]);
export type Participant = t.TypeOf<typeof ParticipantCodec>;

const MeetingCodec = t.type({
  id: t.string,
  participants: t.array(ParticipantCodec),
});
export type Meeting = t.TypeOf<typeof MeetingCodec>;
