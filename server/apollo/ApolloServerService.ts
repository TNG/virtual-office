import { Service } from "typedi";
import { ApolloServer } from "apollo-server-express";
import { Express } from "express";
import { OfficeStore } from "./datasources/OfficeStore";
import { ParticipantsStore } from "./datasources/ParticipantsStore";
import { Server } from "http";
import { ClientConfigStore } from "./datasources/ClientConfigStore";
import { GraphQLSchema } from "graphql";
import { BlockStore } from "./datasources/BlockStore";
import { RoomStore } from "./datasources/RoomStore";
import { SessionStore } from "./datasources/SessionStore";
import { GroupStore } from "./datasources/GroupStore";

@Service()
export class ApolloServerService {
  constructor(
    private readonly officeStore: OfficeStore,
    private readonly blockStore: BlockStore,
    private readonly roomStore: RoomStore,
    private readonly sessionStore: SessionStore,
    private readonly groupStore: GroupStore,
    private readonly participantsStore: ParticipantsStore,
    private readonly clientConfigStore: ClientConfigStore
  ) {}

  async init(expressApp: Express, httpServer: Server, schema: GraphQLSchema): Promise<ApolloServer> {
    const apolloServer = new ApolloServer({
      schema: schema,
      dataSources: () => ({
        officeStore: this.officeStore,
        blockStore: this.blockStore,
        roomStore: this.roomStore,
        sessionStore: this.sessionStore,
        groupStore: this.groupStore,
        participantsStore: this.participantsStore,
        clientConfigStore: this.clientConfigStore,
      }),
      debug: true,
    });
    await apolloServer.start();
    apolloServer.applyMiddleware({ app: expressApp });
    apolloServer.installSubscriptionHandlers(httpServer);

    return apolloServer;
  }
}
