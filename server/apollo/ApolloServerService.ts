import { Service } from "typedi";
import { ApolloServer } from "apollo-server-express";
import { typeDefs } from "./schema";
import { resolvers } from "./resolvers";
import { Express } from "express";
import { OfficeStore } from "./datasources/OfficeStore";

@Service()
export class ApolloServerService {
  constructor(private readonly officeStore: OfficeStore) {}

  async init(expressApp: Express): Promise<ApolloServer> {
    const apolloServer = new ApolloServer({
      typeDefs,
      resolvers,
      dataSources: () => ({
        officeStore: this.officeStore,
      }),
    });
    await apolloServer.start();
    apolloServer.applyMiddleware({ app: expressApp });

    return apolloServer;
  }
}
