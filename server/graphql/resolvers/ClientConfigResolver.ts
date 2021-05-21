import { Query, Resolver } from "type-graphql";
import { Service } from "typedi";
import { ClientConfigStore } from "../../apollo/datasources/ClientConfigStore";
import { ClientConfig } from "../types/ClientConfig";

@Service()
@Resolver((of) => ClientConfig)
export class ClientConfigResolver {
  constructor(private readonly clientConfigStore: ClientConfigStore) {}

  @Query((returns) => ClientConfig)
  async getClientConfig() {
    return this.clientConfigStore.getClientConfig();
  }
}
