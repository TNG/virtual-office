import { FieldResolver, Query, Resolver, ResolverInterface, Root } from "type-graphql";
import { Service } from "typedi";
import { Meeting } from "../types/Meeting";
import { ParticipantsStore } from "../../apollo/datasources/ParticipantsStore";

@Service()
@Resolver((of) => Meeting)
export class MeetingResolver implements ResolverInterface<Meeting> {
  constructor(private readonly participantsStore: ParticipantsStore) {}

  @Query((returns) => [Meeting])
  async getAllMeetings() {
    return this.participantsStore.getAllMeetings();
  }

  @FieldResolver()
  async participants(@Root() meeting: Meeting) {
    return this.participantsStore.getParticipantsInMeeting(meeting.id);
  }
}
