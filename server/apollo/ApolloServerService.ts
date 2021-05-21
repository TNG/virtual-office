import { Container, Service } from "typedi";
import { ApolloServer } from "apollo-server-express";
import { Express } from "express";
import { Server } from "http";
import { buildSchema } from "type-graphql";
import { OfficeResolver } from "../graphql/resolvers/OfficeResolver";
import { MeetingResolver } from "../graphql/resolvers/MeetingResolver";
import { ClientConfigResolver } from "../graphql/resolvers/ClientConfigResolver";
import { ScheduleBlockResolver, SessionBlockResolver } from "../graphql/resolvers/BlockResolver";
import { GroupSessionResolver, RoomSessionResolver } from "../graphql/resolvers/SessionResolver";
import { GroupSession } from "../graphql/types/Session";
import { pubSub } from "./ApolloPubSubService";

@Service()
export class ApolloServerService {
  constructor() {}

  async init(expressApp: Express, httpServer: Server): Promise<ApolloServer> {
    const schema = await buildSchema({
      resolvers: [
        OfficeResolver,
        MeetingResolver,
        ClientConfigResolver,
        ScheduleBlockResolver,
        SessionBlockResolver,
        RoomSessionResolver,
        GroupSessionResolver,
      ],
      container: Container,
      orphanedTypes: [GroupSession],
      pubSub: pubSub,
    });

    const apolloServer = new ApolloServer({
      schema: schema,
      debug: true,
    });
    await apolloServer.start();
    apolloServer.applyMiddleware({ app: expressApp });
    apolloServer.installSubscriptionHandlers(httpServer);

    return apolloServer;
  }
}
