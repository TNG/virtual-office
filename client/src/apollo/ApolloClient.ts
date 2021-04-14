import { ApolloClient, HttpLink, InMemoryCache, NormalizedCacheObject, split } from "@apollo/client";
import { WebSocketLink } from "@apollo/client/link/ws";
import { getMainDefinition } from "@apollo/client/utilities";

const httpLink = new HttpLink({
  uri: "http://localhost:9000/graphql",
});

const wsLink = new WebSocketLink({
  uri: "ws://localhost:9000/graphql",
  options: {
    reconnect: true,
  },
});

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return definition.kind === "OperationDefinition" && definition.operation === "subscription";
  },
  wsLink,
  httpLink
);

let apolloClient: ApolloClient<NormalizedCacheObject> | undefined;

export function getApolloClient(): ApolloClient<NormalizedCacheObject> {
  if (!apolloClient) {
    apolloClient = new ApolloClient({
      link: splitLink,
      cache: new InMemoryCache({
        possibleTypes: {
          Block: ["GroupBlock", "ScheduleBlock", "SessionBlock"],
          Session: ["GroupSession", "RoomSession"],
        },
      }),
      connectToDevTools: true,
    });
  }
  return apolloClient;
}
