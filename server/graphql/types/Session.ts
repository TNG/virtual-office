import { Field, ID, InterfaceType, ObjectType } from "type-graphql";
import { Group } from "./Group";
import { Room } from "./Room";

@ObjectType()
export class Track {
  @Field((type) => ID)
  id!: string;

  @Field()
  name!: string;

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
  }
}

@InterfaceType({ resolveType: (value) => value.constructor.name })
export abstract class Session {
  @Field((type) => ID)
  id!: string;

  @Field()
  type!: string;

  @Field()
  start!: string;

  @Field()
  end!: string;

  @Field({ nullable: true })
  trackName?: string;

  constructor(id: string, type: string, start: string, end: string) {
    this.id = id;
    this.type = type;
    this.start = start;
    this.end = end;
  }
}

@ObjectType({ implements: Session })
export class GroupSession extends Session {
  @Field()
  groupId!: string;

  @Field()
  group!: Group;

  constructor(id: string, start: string, end: string, groupId: string) {
    super(id, "GROUP_SESSION", start, end);
    this.groupId = groupId;
  }
}

@ObjectType({ implements: Session })
export class RoomSession extends Session {
  @Field()
  roomId!: string;

  @Field()
  room!: Room;

  constructor(id: string, start: string, end: string, roomId: string) {
    super(id, "ROOM_SESSION", start, end);
    this.roomId = roomId;
  }
}
