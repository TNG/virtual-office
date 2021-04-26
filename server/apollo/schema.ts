import { makeExecutableSchema } from "apollo-server-express";
import { merge } from "lodash";
import { typeDefsTypes, resolversTypes } from "./typeDefs/types";
import { typeDefsInputTypes } from "./typeDefs/inputTypes";
import { typeDefsQueries, resolversQueries } from "./typeDefs/queries";
import { typeDefsMutations, resolversMutations } from "./typeDefs/mutations";
import { typeDefsSubscriptions, resolversSubscriptions } from "./typeDefs/subscriptions";

export const schema = makeExecutableSchema({
  typeDefs: [typeDefsTypes, typeDefsInputTypes, typeDefsQueries, typeDefsMutations, typeDefsSubscriptions],
  resolvers: merge(resolversTypes, resolversQueries, resolversMutations, resolversSubscriptions),
});
