import { Field, ID, ObjectType } from "type-graphql";

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
