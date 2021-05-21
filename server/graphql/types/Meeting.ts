import { Field, ID, ObjectType } from "type-graphql";

@ObjectType()
export class Meeting {
  @Field((type) => ID)
  id!: string;

  @Field((type) => [String])
  participantIds!: string[];

  @Field((type) => [Participant])
  participants!: Participant[];
}

@ObjectType()
export class Participant {
  @Field((type) => ID)
  id!: string;

  @Field()
  username!: string;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  imageUrl?: string;
}
