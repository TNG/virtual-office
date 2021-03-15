import { MeetingParticipantCodec } from "./MeetingParticipant";
import * as t from "io-ts";

export const MeetingCodec = t.type({
  meetingId: t.string,
  participants: t.array(MeetingParticipantCodec),
});
export type Meeting = t.TypeOf<typeof MeetingCodec>;
