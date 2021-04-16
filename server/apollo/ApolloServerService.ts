import { Service } from "typedi";
import { ApolloServer } from "apollo-server-express";
import { typeDefs } from "./schema";
import { resolvers } from "./resolvers";
import { Express } from "express";
import { OfficeStore } from "./datasources/OfficeStore";
import { ParticipantsStore } from "./datasources/ParticipantsStore";
import { Server } from "http";

@Service()
export class ApolloServerService {
  constructor(private readonly officeStore: OfficeStore, private readonly participantsStore: ParticipantsStore) {}

  async init(expressApp: Express, httpServer: Server): Promise<ApolloServer> {
    const apolloServer = new ApolloServer({
      typeDefs,
      resolvers,
      dataSources: () => ({
        officeStore: this.officeStore,
        participantsStore: this.participantsStore,
      }),
      debug: true,
    });
    await apolloServer.start();
    apolloServer.applyMiddleware({ app: expressApp });
    apolloServer.installSubscriptionHandlers(httpServer);

    return apolloServer;
  }
}