import { Field, ID, ObjectType } from "type-graphql";
import { Room } from "./Room";
import { GroupDb } from "../../types/Group";

@ObjectType()
export class GroupJoinConfig {
  @Field((type) => ID)
  id!: string;

  @Field()
  minimumParticipantCount!: number;

  @Field()
  title!: string;

  @Field()
  description!: string;

  @Field({ nullable: true })
  subtitle?: string;
}

@ObjectType()
export class Group {
  @Field((type) => ID)
  id!: string;

  @Field()
  name!: string;

  @Field((type) => [String])
  roomIds!: string[];

  @Field((type) => [Room])
  rooms!: Room[];

  @Field({ nullable: true })
  description?: String;

  @Field({ nullable: true })
  groupJoinConfig?: GroupJoinConfig;

  constructor(groupDb: GroupDb) {
    this.id = groupDb.id;
    this.name = groupDb.name;
    this.description = groupDb.description;
    this.groupJoinConfig = groupDb.groupJoinConfig;
    this.roomIds = groupDb.rooms;
  }
}
