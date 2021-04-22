import { InMemoryCache } from "@apollo/client";

export const apolloCache = new InMemoryCache({
  possibleTypes: {
    Block: ["GroupBlock", "ScheduleBlock", "SessionBlock"],
    Session: ["GroupSession", "RoomSession"],
  },
});
