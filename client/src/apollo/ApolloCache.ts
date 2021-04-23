import { InMemoryCache } from "@apollo/client";
import { ParticipantApollo } from "../../../server/apollo/TypesApollo";

export const apolloCache = new InMemoryCache({
  possibleTypes: {
    Block: ["GroupBlock", "ScheduleBlock", "SessionBlock"],
    Session: ["GroupSession", "RoomSession"],
  },
  typePolicies: {
    Query: {
      fields: {
        getBlock(_, { args, toReference, isReference, readField }) {
          const typeNames = ["GroupBlock", "ScheduleBlock", "SessionBlock"];
          for (const type of typeNames) {
            if (readField("__typename", toReference({ __typename: type, id: args!.id }))) {
              return toReference({ __typename: type, id: args!.id });
            }
          }
        },
        getGroup(_, { args, toReference }) {
          return toReference({ __typename: "Group", id: args!.id });
        },
        getGroupJoinConfig(_, { args, toReference }) {
          return toReference({ __typename: "GroupJoinConfig", id: args!.id });
        },
        getRoom(_, { args, toReference }) {
          return toReference({ __typename: "Room", id: args!.id });
        },
        getParticipantsInMeeting(_, { args, toReference, readField }) {
          return readField<ParticipantApollo[]>("participants", toReference({ __typename: "Meeting", id: args!.id }));
        },
      },
    },
  },
});
