import { Field, ID, ObjectType } from "type-graphql";

@ObjectType()
export class ClientConfig {
  @Field((type) => ID)
  id!: string;

  @Field()
  viewMode!: string;

  @Field()
  theme!: string;

  @Field()
  sessionStartMinutesOffset!: number;

  @Field({ nullable: true })
  backgroundUrl?: string;

  @Field({ nullable: true })
  timezone?: string;

  @Field({ nullable: true })
  title?: string;

  @Field({ nullable: true })
  logoUrl?: string;

  @Field({ nullable: true })
  faviconUrl?: string;

  @Field({ nullable: true })
  hideEndedSessions?: boolean;
}
