import { v4 as uuid } from "uuid";
import { ClientConfig } from "../../server/types/ClientConfig";

export const defaultClientConfig: ClientConfig = {
  id: uuid(),
  viewMode: "grid",
  theme: "dark",
  sessionStartMinutesOffset: 10,
};
