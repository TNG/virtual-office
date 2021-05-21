import { Field, ID, ObjectType } from "type-graphql";
import { RoomDb } from "../../types/Room";

@ObjectType()
export class SlackNotification {
  @Field((type) => ID)
  id!: string;

  @Field()
  channelId!: string;

  @Field({ nullable: true })
  notificationInterval?: number;
}

@ObjectType()
export class Room {
  @Field((type) => ID)
  id!: string;

  @Field()
  name!: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  joinUrl?: string;

  @Field({ nullable: true })
  titleUrl?: string;

  @Field({ nullable: true })
  icon?: string;

  @Field((type) => [RoomLink], { nullable: true })
  roomLinks?: RoomLink[];

  @Field({ nullable: true })
  slackNotification?: SlackNotification;

  @Field({ nullable: true })
  meetingId?: string;

  constructor(roomDb: RoomDb) {
    this.id = roomDb.id;
    this.name = roomDb.name;
    this.description = roomDb.description;
    this.joinUrl = roomDb.joinUrl;
    this.titleUrl = roomDb.titleUrl;
    this.icon = roomDb.icon;
    this.roomLinks = roomDb.roomLinks;
    this.slackNotification = roomDb.slackNotification;
    this.meetingId = roomDb.meetingId;
  }
}

@ObjectType()
export class RoomLink {
  @Field((type) => ID)
  id!: string;

  @Field()
  href!: string;

  @Field()
  text!: string;

  @Field({ nullable: true })
  icon?: string;

  @Field({ nullable: true })
  linkGroup?: string;
}
