import { FieldResolver, Resolver, ResolverInterface, Root } from "type-graphql";
import { Service } from "typedi";
import { GroupSession, RoomSession } from "../types/Session";
import { RoomStore } from "../../apollo/datasources/RoomStore";
import { GroupStore } from "../../apollo/datasources/GroupStore";

@Service()
@Resolver((of) => RoomSession)
export class RoomSessionResolver implements ResolverInterface<RoomSession> {
  constructor(private readonly roomStore: RoomStore) {}

  @FieldResolver()
  async room(@Root() session: RoomSession) {
    const room = this.roomStore.getRoom(session.roomId);
    if (!room) {
      throw new Error("Room not found");
    }
    return room;
  }
}

@Service()
@Resolver((of) => GroupSession)
export class GroupSessionResolver implements ResolverInterface<GroupSession> {
  constructor(private readonly groupStore: GroupStore) {}

  @FieldResolver()
  async group(@Root() session: GroupSession) {
    const group = this.groupStore.getGroup(session.groupId);
    if (!group) {
      throw new Error("Group not found");
    }
    return group;
  }
}
