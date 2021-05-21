import { Field, ID, ObjectType } from "type-graphql";
import { Participant } from "./Participant";

@ObjectType()
export class Meeting {
  @Field((type) => ID)
  id!: string;

  @Field((type) => [String])
  participantIds!: string[];

  @Field((type) => [Participant])
  participants!: Participant[];
}
