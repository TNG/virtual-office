import { InMemoryCache } from "@apollo/client";

export const apolloCache = new InMemoryCache({
  possibleTypes: {
    Block: ["GroupBlock", "ScheduleBlock", "SessionBlock"],
    Session: ["GroupSession", "RoomSession"],
  },
  typePolicies: {
    Query: {
      fields: {
        getParticipantInMeeting(_, { args, toReference }) {
          return toReference({
            __typename: "Participant",
            id: args!.id,
          });
        },
      },
    },
  },
});
