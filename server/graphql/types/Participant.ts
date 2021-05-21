import { Field, ID, ObjectType } from "type-graphql";
import { MutationResponse } from "./MutationResponse";

@ObjectType()
export class Participant {
  @Field((type) => ID)
  id!: string;

  @Field()
  username!: string;

  @Field({ nullable: true })
  email?: String;

  @Field({ nullable: true })
  imageUrl?: String;
}

@ObjectType({ implements: MutationResponse })
export class ParticipantMutatedResponse extends MutationResponse {
  @Field()
  participant!: Participant;

  @Field((type) => ID)
  meetingId!: string;
}
