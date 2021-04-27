import { makeExecutableSchema } from "apollo-server-express";
import { merge } from "lodash";
import { typeDefsTypes, resolversTypes } from "./types";
import { typeDefsInputTypes } from "./inputTypes";
import { typeDefsQueries, resolversQueries } from "./queries";
import { typeDefsMutations, resolversMutations } from "./mutations";
import { typeDefsSubscriptions, resolversSubscriptions } from "./subscriptions";

export const schema = makeExecutableSchema({
  typeDefs: [typeDefsTypes, typeDefsInputTypes, typeDefsQueries, typeDefsMutations, typeDefsSubscriptions],
  resolvers: merge(resolversTypes, resolversQueries, resolversMutations, resolversSubscriptions),
});
