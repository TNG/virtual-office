import React, { createContext } from "react"; //
import { ClientConfigApollo } from "../../../server/apollo/TypesApollo";
import { v4 as uuid } from "uuid";

const defaultClientConfig: ClientConfigApollo = {
  id: uuid(),
  viewMode: "grid",
  theme: "dark",
  sessionStartMinutesOffset: 10,
};

export const ClientConfigContext: React.Context<ClientConfigApollo> = createContext(defaultClientConfig);
export const ClientConfigProvider: React.Provider<ClientConfigApollo> = ClientConfigContext.Provider;
