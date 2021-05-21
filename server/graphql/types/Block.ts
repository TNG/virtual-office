import { Field, ID, InterfaceType, ObjectType } from "type-graphql";
import { Group } from "./Group";
import { RoomSession, Session, Track } from "./Session";

@InterfaceType()
export abstract class Block {
  @Field((type) => ID)
  id!: string;

  @Field()
  type!: string;

  @Field({ nullable: true })
  name?: string;

  protected constructor(id: string, type: string) {
    this.id = id;
    this.type = type;
  }
}

@ObjectType({ implements: Block })
export class GroupBlock extends Block {
  @Field()
  groupId!: string;

  @Field()
  group!: Group;

  constructor(id: string, groupId: string) {
    super(id, "GROUP_BLOCK");
    this.groupId = groupId;
  }
}

@ObjectType({ implements: Block })
export class ScheduleBlock extends Block {
  @Field((type) => [String])
  sessionIds!: string[];

  @Field((type) => [Session])
  sessions!: Session[];

  @Field((type) => [Track], { nullable: true })
  tracks?: Track[];

  constructor(id: string, sessionIds: string[], tracks?: Track[]) {
    super(id, "SCHEDULE_BLOCK");
    this.sessionIds = sessionIds;
    this.tracks = tracks;
  }
}

@ObjectType({ implements: Block })
export class SessionBlock extends Block {
  @Field()
  title!: string;

  @Field((type) => [String])
  sessionIds!: string[];

  @Field((type) => [RoomSession])
  sessions!: RoomSession[];

  constructor(id: string, title: string, sessionIds: string[]) {
    super(id, "SESSION_BLOCK");
    this.title = title;
    this.sessionIds = sessionIds;
  }
}
