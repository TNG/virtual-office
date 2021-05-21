import { Arg, FieldResolver, ID, Query, Resolver, ResolverInterface, Root, Subscription } from "type-graphql";
import { Service } from "typedi";
import { Meeting } from "../types/Meeting";
import { ParticipantsStore } from "../../apollo/datasources/ParticipantsStore";
import { Participant, ParticipantMutatedResponse } from "../types/Participant";

@Service()
@Resolver((of) => Meeting)
export class MeetingResolver implements ResolverInterface<Meeting> {
  constructor(private readonly participantsStore: ParticipantsStore) {}

  @Query((returns) => [Meeting])
  async getAllMeetings() {
    return this.participantsStore.getAllMeetings();
  }

  @Query((returns) => [Participant])
  async getParticipantsInMeeting(@Arg("id", (type) => ID) id: string) {
    return this.participantsStore.getParticipantsInMeeting(id);
  }

  @Subscription({
    topics: ["PARTICIPANT_ADDED", "PARTICIPANT_REMOVED"],
    filter: ({ payload }) => payload.success,
  })
  participantMutated(@Root() participantMutatedResponse: ParticipantMutatedResponse): ParticipantMutatedResponse {
    return participantMutatedResponse;
  }

  @FieldResolver()
  async participants(@Root() meeting: Meeting) {
    return this.participantsStore.getParticipantsInMeeting(meeting.id);
  }
}
