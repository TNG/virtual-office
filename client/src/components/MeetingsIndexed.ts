import { Meeting } from "../../../server/express/types/Meeting";

export interface MeetingsIndexed {
  [meetingId: string]: Meeting;
}
