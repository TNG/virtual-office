import { FieldResolver, Resolver, ResolverInterface, Root } from "type-graphql";
import { Service } from "typedi";
import { ScheduleBlock, SessionBlock } from "../types/Block";
import { SessionStore } from "../../apollo/datasources/SessionStore";
import { RoomSession, Session } from "../types/Session";

@Service()
@Resolver((of) => ScheduleBlock)
export class ScheduleBlockResolver implements ResolverInterface<ScheduleBlock> {
  constructor(private readonly sessionStore: SessionStore) {}

  @FieldResolver()
  async sessions(@Root() block: ScheduleBlock) {
    return block.sessionIds
      .map((sessionId) => this.sessionStore.getSession(sessionId))
      .filter((session: Session | undefined): session is Session => session !== undefined);
  }
}

@Service()
@Resolver((of) => SessionBlock)
export class SessionBlockResolver implements ResolverInterface<SessionBlock> {
  constructor(private readonly sessionStore: SessionStore) {}

  @FieldResolver()
  async sessions(@Root() block: SessionBlock) {
    return block.sessionIds
      .map((sessionId) => this.sessionStore.getSession(sessionId))
      .filter(
        (session: Session | undefined): session is RoomSession =>
          session !== undefined && session.type === "ROOM_SESSION"
      );
  }
}
