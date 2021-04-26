import { Service } from "typedi";
import { ApolloServer } from "apollo-server-express";
import { Express } from "express";
import { OfficeStore } from "./datasources/OfficeStore";
import { ParticipantsStore } from "./datasources/ParticipantsStore";
import { Server } from "http";
import { ClientConfigStore } from "./datasources/ClientConfigStore";
import { schema } from "./schema";

@Service()
export class ApolloServerService {
  constructor(
    private readonly officeStore: OfficeStore,
    private readonly participantsStore: ParticipantsStore,
    private readonly clientConfigStore: ClientConfigStore
  ) {}

  async init(expressApp: Express, httpServer: Server): Promise<ApolloServer> {
    const apolloServer = new ApolloServer({
      schema: schema,
      dataSources: () => ({
        officeStore: this.officeStore,
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
