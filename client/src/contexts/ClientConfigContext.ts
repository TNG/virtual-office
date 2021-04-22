import { ClientConfigApollo } from "../../../server/apollo/TypesApollo";
import { v4 as uuid } from "uuid";

export const defaultClientConfig: ClientConfigApollo = {
  id: uuid(),
  viewMode: "grid",
  theme: "dark",
  sessionStartMinutesOffset: 10,
};
